# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

The Colour Wall is a live Next.js / Vercel / Supabase / Stripe product at https://colour-wall.vercel.app. Primary audience is the user's TikTok lyrics-account traffic — mobile-first, short-attention, share-driven.

**Current product (live, working)**:
- **The First Wall**: a 100×100 public canvas = 10,000 spaces
- $1 per square, charged through **live Stripe** (Stripe live mode is active)
- Single-square checkout — pick one cell, optional message/name/link, pay $1
- Multi-square batch checkout — toggle Select multiple, click or drag-paint across cells, pay one combined $N transaction
- Drag-to-select with an 8 px pixel threshold (so jittery taps still toggle correctly on mobile)
- Stripe webhook is the **only** path that flips a square from `pending` → `claimed`
- Vercel Web Analytics for privacy-light, cookie-less aggregate counts
- Custom OG image for social shares

**The Million Wall (future narrative, NOT built)**:
- A 1,000,000-cell wall that "opens when The First Wall fills"
- Exists only as copy on the banner, progress component, and success page
- Provides scarcity / suspense without any infrastructure cost. **Do not build until The First Wall is substantially validated** (~80% claimed). The narrative is more valuable unbuilt — premature implementation kills the suspense.

**Goal**: traffic, conversion, sharing, trust. Not unnecessary features.

## Core operating principles

- **Build only what improves conversion, sharing, trust, or measurement.** If a proposal doesn't move one of those four, defer.
- **Do not overbuild.** Small, reversible changes win over architectural rewrites.
- **Do not implement The Million Wall yet.** Most important "no" in the repo. Revisit when The First Wall crosses ~80% claimed.
- **Prefer small, reversible changes.** Single-file edits over multi-file refactors. Tiny commits over big ones.
- **Ask before structural / backend / security changes.** Schema, webhook, payment routes, env vars, Stripe mode — all gated on explicit approval.

## Absolute safety rules (hard, no exceptions)

- ❌ Do not change Stripe mode (currently **live**).
- ❌ Do not change env vars.
- ❌ Do not commit `.env.local` or any secrets.
- ❌ Do not edit Supabase rows manually to fake claims.
- ❌ Do not fake traffic, users, testimonials, live viewers, or claims.
- ❌ Do not bypass the Stripe webhook. Only the verified webhook flips `status = 'claimed'`.
- ❌ Do not change `app/api/checkout/route.ts`, `app/api/checkout/batch/route.ts`, `app/api/stripe/webhook/route.ts`, or the Supabase schema unless explicitly approved.
- ❌ Do not weaken RLS, signature verification, or the `.select()`-on-placeholder-swap pattern.

## Required workflow before commits

Every code change must:

1. Run `git status` and show changed files
2. Confirm payment/security routes have **0-line diff** unless the task explicitly involves them:
   - `app/api/checkout/route.ts`
   - `app/api/checkout/batch/route.ts`
   - `app/api/stripe/webhook/route.ts`
3. Confirm `.env.local` is ignored (`git check-ignore -v .env.local`) and not staged
4. Confirm no secrets are staged (`grep -RInE 'sk_(test|live)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}'`)
5. Run `npm run typecheck`
6. Run `npm run build`
7. **Wait for explicit approval before committing**, unless the user already said "commit and push" in the same turn

## Coding style

- **Minimal, clean UI.** No clutter. Hero should not have more than the essentials.
- **TikTok-friendly copy.** Short, poetic, clear. Sub-5-second comprehension on mobile.
- **Mobile-first.** Most traffic is touch + small viewport.
- **Honest scarcity only.** Real claim count, real percentages, never fake. The "first 100" framing was deliberately retired in favour of the Million Wall narrative.
- **Do not break existing single-square or batch checkout flows.** Both work; both must keep working.
- **Analytics: privacy-light, aggregate-only.** Never send message/name/link/coords/card details to analytics. Booleans (`has_message`) and counts (`count: number`) are fine.

## Architecture — the load-bearing pieces

### Payment security invariant (do not break)

Only the signature-verified Stripe webhook (`app/api/stripe/webhook/route.ts`) may flip a square from `pending` → `claimed`. Every other code path is read-only or only writes `pending` rows. The entire payment model depends on this rule.

### Single-square reservation handshake (`/api/checkout`)

Insert a `pending` row with a placeholder `stripe_session_id`, create the Stripe Checkout Session, then **swap the placeholder for the real `session.id`** before redirecting. The swap MUST use `.select()` and treat 0 rows updated as a hard failure — without `.select()`, supabase-js returns `error: null` even when no rows matched, the user reaches Checkout, and the webhook never finds the row. On any failure: `stripe.checkout.sessions.expire(session.id)` and delete the placeholder row. This bug existed once; the fix is the reason `.select()` is there.

### Multi-square batch reservation (`/api/checkout/batch`)

Different pattern: **Stripe-first**, then call the `reserve_squares_batch` RPC with the real session id and a route-generated `batch_id`. If the RPC fails (any unavailable cell), expire the Stripe session. No placeholder swap needed because we have the real id up front. The RPC is an atomic Postgres transaction — either every cell in the batch is reserved or none are. Cap: 50 squares per batch (`MAX_BATCH_SIZE`). All squares share one `stripe_session_id` and one `batch_id` so the webhook's single update query matches N rows at once.

### Webhook handles both single and batch with the same query

`UPDATE squares SET status='claimed' WHERE stripe_session_id=$1 AND status='pending'` matches 1 row for single, N rows for batch (after `0004_batches.sql` dropped the UNIQUE constraint on `stripe_session_id`). The webhook also has audit updates on `checkout_batches` and structured no-match diagnostics that inspect `metadata.batch_id` (batch) or `metadata.x/y` (single).

### RPCs

`supabase/migrations/0001_init.sql` introduces `reserve_square` for single-square as `INSERT … ON CONFLICT (x,y) DO UPDATE … WHERE squares.status = 'pending' AND squares.pending_until < now()`. Migration `0004_batches.sql` adds `reserve_squares_batch` which iterates and verifies each insert. `(x, y)` is the primary key so duplicate claims are physically impossible. Single caller per RPC, so changing signatures is safe but requires a migration.

### Migration ordering

`supabase/migrations/` in order: `0001_init`, `0002_feelings`, `0003_broaden_categories`, `0004_batches`. **Apply migrations to the production DB before deploying app code** — schema/RPC changes precede the code that uses them. All migrations are idempotent (`if not exists`, `drop … if exists`).

### Webhook miss diagnostics

When `checkout.session.completed` arrives but no pending row matches, the route logs structured diagnostics: row status, timestamps, `session_id_matches` boolean, and a 12-char `stored_session_id_prefix` (distinguishes `placeholder_…` from `cs_live_…` without echoing the full id). For batch, also looks up `checkout_batches` by `metadata.batch_id`. Preserve this pattern when changing the webhook.

### RLS + public read surface

The `squares` and `checkout_batches` tables have RLS enabled. `squares` has one anon-readable policy: `using (status = 'claimed')`. `checkout_batches` has no policies (server-only). Pending rows, Stripe session ids, batch metadata, and price details are never visible to anon. Server code uses the service-role key via `getServiceClient()`; client code never talks to Supabase directly. `/api/squares` GET filters `status = 'claimed'` explicitly as defense-in-depth.

### `feeling_category` is named historically

The DB column `feeling_category` is now used as a generic optional "Vibe" tag (Art / Tribute / Shout-out / Memory / Just for fun / Love / Happy / etc.). The dropdown UI was removed in the simplification pass, but the column stays for legacy rows. Don't rename the column.

### Drag-to-select pattern

`components/Grid.tsx` includes pointer-event handlers that activate only when `selectMode === true`. An 8 px pixel-distance threshold (`DRAG_THRESHOLD_PX`) gates drag activation, so jittery taps still toggle correctly on mobile. Multi-touch is hardened: second pointer is ignored while first is dragging. `touch-action: none` is conditional on `selectMode` so the page can still scroll normally outside select mode.

### Landing composition

`app/page.tsx` is a server component that loads all claimed squares once and feeds them to `<Grid>` and `<LatestMarks>`. Hero CTA scrolls to `id="wall-mat"` on the actual mat div (not the top of the wall section) to minimise friction. Section order: Hero → wall section (`WallLaunchBanner` → `HowItWorks` strip → `Grid` which renders `JumpToSquare`, `WallToolbar`, the mat, `WallProgress`, modals) → `TikTokHook` → `MakeYourMark` → `LatestMarks` → `WhyOneDollar` → `Footer`.

## Current important files

| File | Purpose |
|---|---|
| `app/api/checkout/route.ts` | Single-square checkout. Reserve-first with placeholder swap. **Do not touch unless explicitly approved.** |
| `app/api/checkout/batch/route.ts` | Multi-square checkout. Stripe-first with atomic RPC reservation. **Do not touch unless explicitly approved.** |
| `app/api/stripe/webhook/route.ts` | Verified webhook. **Only path that may flip status='claimed'.** Do not touch unless explicitly approved. |
| `components/Grid.tsx` | Wall renderer + drag-to-select + click handlers + modal mounting. Most state-heavy component. |
| `components/ClaimDialog.tsx` | Single-square modal. Bottom-sheet on mobile. |
| `components/BatchClaimDialog.tsx` | Multi-square modal. Shared color/message/name/link for N cells. |
| `app/success/page.tsx` | Success page with two branches (single via `?x=&y=`, batch via `?batch=<uuid>`). Server-fetches cell/batch metadata for the SuccessSquareCard. |
| `app/success/SuccessActions.tsx` | Share button (Web Share API + clipboard fallback) and Back-to-wall link. Coord-aware share text. |
| `components/WallLaunchBanner.tsx` | "[ THE FIRST WALL IS LIVE ]" + Million Wall narrative banner above the wall. |
| `components/WallProgress.tsx` | Honest progress bar below the wall: real claim count, real %, milestone ticks. Drives the Million Wall narrative. |
| `app/privacy/page.tsx` | Honest privacy disclosure including Vercel Analytics, no PII to analytics. |

## Decision rules

For any feature idea:

- **Improves conversion / sharing / trust / measurement** → propose with file list, copy, risks. Wait for approval.
- **Infrastructure for unvalidated scale** (Million Wall, real-time presence, custom domains, premium tiers, native apps, etc.) → defer. The First Wall isn't full.
- **Moderation / legal / payment / security risk** → warn before any code. Examples: image uploads, comments/reactions, user accounts, NFT integration, anything touching webhook/checkout, any change to Stripe receipt/disclosure text.
- **Could reduce checkout conversion** (extra fields, gates, banners between Hero and grid, slow loads) → explain the tradeoff before coding. Default is "ship a faster path".

## Response format for future tasks

When the user asks for a feature:

1. **Propose first** — exact files to edit, exact copy/UI changes, risk level, payment-touch verdict
2. **State what stays untouched** — webhook + both checkout routes + schema + env at minimum
3. **Identify risks** — concrete failure modes, not generic warnings
4. **Wait for approval**
5. **Then code**
6. **After coding, show quality checks**:
   - `git status` output
   - `git diff app/api/stripe/webhook/route.ts | wc -l` (must be 0 unless explicitly touched)
   - Same for both checkout routes
   - `.env.local` ignored, no secrets staged
   - `npm run typecheck` clean
   - `npm run build` clean
   - Full diff inventory
7. **Wait again before committing**, unless the user already authorised the commit in the same turn

## Commands

```bash
npm install           # one-time
npm run dev           # local dev (Next.js, http://localhost:3000)
npm run typecheck     # tsc --noEmit
npm run build         # next build (also runs ESLint + types)
npm run lint          # next lint standalone
```

No test suite. `npm run typecheck && npm run build` is the verification step.

For the full payment flow locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook` in a second terminal; copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart `npm run dev`. **Local dev uses test-mode Stripe keys in `.env.local`; production uses live keys in Vercel env vars. Do not cross-pollinate.**

## Project slash commands

Reusable workflow shortcuts live in `.claude/commands/` (see the README in that folder for full reference):

- `/precommit` — runs the verification ritual (git status, 0-diff check on payment routes, env+secret scan, typecheck, build). Use before every commit.
- `/smoke` — curl-side production smoke test + manual checklist. Use after every deploy.
- `/audit-conversion` — structured conversion-blocker audit. Use periodically.
- `/bug-fix <description>` — disciplined bug-fix workflow (reproduce → hypothesise → propose → approve → fix → verify). Use when bugs happen.
- `/vercel-logs <paste>` — diagnose structured log lines from `/api/checkout`, `/api/checkout/batch`, `/api/stripe/webhook`. Use when something fails in prod.

## Repo vs brand

The repo is named `dollar-grid` for historical reasons. The public brand is **The Colour Wall**. Do not reintroduce "Dollar Grid" or "The Mood Grid" (a previous, narrower rebrand) in user-facing strings.

## Hard "do not introduce" list

User accounts · image uploads · NFTs · subscriptions · admin panels · real-time WebSocket presence · cookie-based session tracking · email collection / waitlist · custom domains for premium tiers · third-party API · mobile native apps · comments / reactions on squares · The Million Wall implementation (until The First Wall is substantially validated).

Don't add any of these without an explicit ask, even if a refactor seems to invite them.
