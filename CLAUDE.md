# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo vs brand

The repo is named `dollar-grid` for historical reasons. The public brand is **The Colour Wall** — a 100×100 public canvas where users claim individual squares for $1, choose a colour, and optionally leave a vibe/message/name/link. Multi-square claims (pixel art, initials) are a first-class use case in the copy. Do not reintroduce "Dollar Grid" or "The Mood Grid" (a previous, narrower rebrand) in user-facing strings.

## Commands

```bash
npm install           # one-time
npm run dev           # local dev (Next.js, http://localhost:3000)
npm run typecheck     # tsc --noEmit
npm run build         # next build (also runs ESLint + types)
npm run lint          # next lint standalone
```

There is no test suite. Run `npm run typecheck && npm run build` after every meaningful change — `next build` is the closest thing to a verification step.

For the full payment flow locally you also need `stripe listen --forward-to localhost:3000/api/stripe/webhook` in a second terminal; copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart `npm run dev`.

## Architecture — the load-bearing pieces

### Payment security invariant (do not break)

Only the signature-verified Stripe webhook (`app/api/stripe/webhook/route.ts`) may flip a square from `pending` → `claimed`. Every other code path — page loads, `/api/squares`, `/api/checkout` — is read-only or only ever writes `pending` rows. If you find yourself wanting to mark something `claimed` from anywhere else, stop and reconsider; the entire payment model depends on this rule. The `feedback_payment_invariant` memory file documents the prior incident.

### The reservation handshake (`/api/checkout`)

The flow is: insert a `pending` row with a placeholder `stripe_session_id`, create the Stripe Checkout Session, then **swap the placeholder for the real `session.id`** before returning the redirect URL. The swap MUST use `.select()` and treat a 0-row update as a hard failure — without `.select()`, supabase-js returns `error: null` even when no rows matched, which would let the user reach Checkout while the DB still holds the placeholder, and the webhook would then never find the row. On any failure (zero-row update OR thrown error) the route must `stripe.checkout.sessions.expire(session.id)` and delete the placeholder row so the cell is freed and no orphan payment can land. This bug existed once; the fix is the reason `.select()` is there.

### `reserve_square` RPC

`supabase/migrations/0001_init.sql` introduces this as the atomic reservation primitive — an `INSERT … ON CONFLICT (x,y) DO UPDATE … WHERE squares.status = 'pending' AND squares.pending_until < now()` that either inserts a fresh hold, takes over an expired hold, or returns no row when the cell is actively held/claimed. `(x, y)` is the primary key, so duplicate claims are physically impossible. There is exactly one caller (`/api/checkout`), so changing the signature is safe but requires a migration that drops + recreates the function (see `0002_feelings.sql`).

### Webhook miss diagnostics

When `checkout.session.completed` arrives but no pending row matches, the route does a follow-up lookup by `metadata.x/y` and logs structured diagnostics: row status, timestamps, `session_id_matches` boolean, and a 12-char `stored_session_id_prefix` (enough to distinguish `placeholder_…` from `cs_test_…`/`cs_live_…` without echoing the full id). Preserve this pattern when changing the webhook — it's how the original placeholder-swap bug was diagnosed.

### RLS + public read surface

The `squares` table has RLS enabled with one anon-readable policy: `using (status = 'claimed')`. Pending rows, Stripe session ids, and price details are never visible to the anon role. Server code uses the service-role key (`getServiceClient()` in `lib/supabase/server.ts`); client code never talks to Supabase directly. `/api/squares` GET filters `status = 'claimed'` explicitly as defense-in-depth.

### `feeling_category` is named historically

The DB column `feeling_category` is now used as a generic optional "Vibe" tag (Art / Tribute / Shout-out / Memory / Just for fun / Love / Happy / etc.). The user-facing label is "Vibe" everywhere. Don't rename the column — that's destructive and the misalignment is documented. The enum is the union defined in `lib/validation.ts` and enforced by the CHECK constraint in migration `0003_broaden_categories.sql`.

### Migration ordering

Numbered migrations in `supabase/migrations/` must be applied in order. **Apply migrations to the production DB before deploying app code** — `0002` changes the `reserve_square` signature, and the new `/api/checkout` will fail against the pre-`0002` function. Migrations are idempotent (`if not exists`, `drop … if exists`); re-running is safe.

### Landing composition

`app/page.tsx` is a server component that loads all claimed squares once and feeds them to both `<Grid>` (the wall) and `<LatestMarks>` (server-rendered most-recent-12 social-proof rail) — one DB read, no client polling. Sections compose top-down: Hero → wall (anchored `#wall`, the CTA scrolls here) → TikTokHook → HowItWorks → LatestMarks → WhyOneDollar → Footer.

## Tone and copy guidelines

- Audience is mobile-first TikTok traffic. Keep time-to-understand under 5 seconds.
- Tone is emotional, sincere, modern, creative — not corporate, not scammy.
- Vibe and Message fields are both **optional**. Never gate checkout on either.
- Encourage both single-square claims and multi-square pixel-art workflows in copy.

## Hard "do not introduce" list (per user direction)

User accounts · image uploads · NFTs · subscriptions · admin panels. Don't add these without an explicit ask, even if a refactor seems to invite them.
