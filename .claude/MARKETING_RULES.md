# Marketing Automation — Global Rules

**This file is the single source of truth for all marketing slash commands. Every command MUST read it first. If a command's prompt contradicts this file, this file wins.**

---

## 1. Hard blocklist — paths that must NEVER be created, edited, or deleted

- `app/api/stripe/**`
- `app/api/webhooks/**`
- `app/api/checkout/**`
- `app/api/checkout/batch/**`
- `middleware.ts` (if it touches auth or payments)
- `lib/stripe*`, `lib/supabase*`
- `supabase/**`
- `.env`, `.env.*`, `.env.local`, `.env.production`, `.env.development`
- `next.config.*` (do not modify build, redirects, headers, or analytics config)
- `package.json`, `package-lock.json` (do not change dependencies)
- Any file under `app/`, `components/`, `lib/`, `public/` unless explicitly stated in a command (none currently are)
- Any file or route named `million-wall`, `the-million-wall`, or `million_wall` — including planning, copy, drafts, and metadata

## 2. Hard blocklist — actions Claude must NEVER take

- Post, send, publish, or transmit anything to any external service (TikTok, Reddit, X, Hacker News, Indie Hackers, Product Hunt, email, Discord, etc.)
- Make HTTP requests, run `curl`, `wget`, `fetch`, or call any external API
- Send email, open `mailto:` handlers, trigger any messaging client
- Fetch live community rules, live analytics, live Stripe data, or live Supabase data
- Change Stripe mode (test ↔ live), edit env vars, edit Supabase schema, or modify any payment/webhook logic
- Auto-commit, auto-push, or auto-create branches. Stop at files-written + verification.

## 3. Content rules — must NEVER appear in any draft

- Invented user counts, sales figures, revenue, "X squares sold", or any number not present in `marketing/config/claims.md`
- Invented testimonials, quotes, press mentions, partnerships, notable buyers, or endorsements
- Invented personal stories ("I bought a square and...", "my friend tried it...")
- Fake scarcity or urgency: "selling out", "only X left", "last chance", "going viral", "people are rushing", "limited time", countdown framings
- "Get rich", "make money fast", investment-grade, or financial-return language
- Crypto, NFT, blockchain, Web3, token, mint, or drop language
- Corporate SaaS jargon: "synergy", "leverage", "unlock", "best-in-class", "world-class", "revolutionary", "disrupt", "game-changer"
- Mentions of **The Million Wall** in any SEO, TikTok, outreach, plan, or review draft — unless Austin explicitly requests Million Wall copy in the chat

## 4. Content rules — every claim must be traceable

- All factual claims about The Colour Wall must trace to a line in `marketing/config/claims.md`.
- If a needed claim is not in `claims.md`, write `[CLAIM NEEDED — Austin to add to claims.md]` instead of inventing.
- If community rules / platform rules are not in the relevant config file, write `RULES UNKNOWN — Austin to verify before posting`.

## 5. TikTok account separation (critical)

**Main account (Austin's existing personal/mixed account):**
- Niche is NOT The Colour Wall. Do not change it.
- Max 1–2 soft mentions per week.
- The Colour Wall mention must be incidental — never the hook, never the main pillar, never the CTA.
- No "buy a square" CTA on this account.
- No repeated project-promo posts that would shift the account's apparent niche.

**Separate Colour Wall account:**
- Full focus on The Colour Wall is allowed.
- Still bound by all content rules above (no fake scarcity, no invented numbers, no Million Wall mentions).

## 6. Output rules — every draft

- Output is **draft only**. Filename must start with `DRAFT-`.
- Frontmatter must include `status: draft`.
- Final section of every draft must be a "Human approval" checklist or a "DO NOT POST until approval" gate.
- Drafts live only under `marketing/` — never inside `app/`, `components/`, `public/`, or any production path.

## 7. Verification — every command, before declaring done

1. Run `npm run typecheck` — must pass.
2. Run `npm run build` — must pass.
3. Print the list of files created or modified.
4. **Do not commit. Do not stage. Do not branch. Do not push.** Stop and report.
5. If typecheck or build fails, do not claim success. Surface the error and stop.

## 8. Tools each command may use

- Read: any file under `marketing/`, `.claude/`, plus `README.md`, `package.json`, `app/page.tsx`, `app/layout.tsx`, and existing route filenames (read-only, for context only).
- Write: only inside `marketing/<command-specific-subpath>/`.
- Bash: only `npm run typecheck` and `npm run build`. No other shell commands.

## 9. If unsure — stop

If a command is asked to do anything that is not explicitly permitted above (e.g. "also post this", "send an email", "update the homepage copy", "add a Million Wall teaser"), the correct behaviour is:

1. Refuse.
2. Quote this file's rule that blocks it.
3. Ask Austin in chat what he wants instead.
