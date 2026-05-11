# Project slash commands

Reusable workflow shortcuts for The Colour Wall. Invoked in Claude Code as
`/<command-name>`. Each is a plain markdown prompt that Claude will follow.

Run `/precommit` before committing any change, even docs-only changes.

| Command | When to use |
|---|---|
| `/precommit` | Before every commit. Runs the verification ritual: `git status`, 0-diff check on payment routes (`app/api/checkout/route.ts`, `app/api/checkout/batch/route.ts`, `app/api/stripe/webhook/route.ts`), `.env.local` ignore check, secret scan, `npm run typecheck`, `npm run build`. |
| `/smoke` | After every deploy. Curl-side production checks (homepage HTML, OG image, privacy page) + manual checklist for the parts only your browser can verify. |
| `/audit-conversion` | Periodically. Ranks conversion blockers by impact-to-effort across hero, wall, modals, success page, mobile. |
| `/bug-fix <description>` | When something breaks. Forces disciplined single-hypothesis debugging. Never weakens payment/webhook security. |
| `/vercel-logs <paste>` | When the production logs show something weird. Identifies known `[checkout]` / `[webhook]` log patterns and points to the right fix surface (Vercel / Supabase / Stripe / code). |

## Hard rules these commands enforce

- No code changes to `app/api/checkout/route.ts`, `app/api/checkout/batch/route.ts`,
  or `app/api/stripe/webhook/route.ts` without explicit user acknowledgement.
- No commits without `/precommit` passing.
- No fake activity, fake claims, fake testimonials, fake live counts.
- Payment / Stripe / Supabase schema / env var changes are always gated on
  explicit user approval.

See `CLAUDE.md` at the repo root for the full project rulebook.
