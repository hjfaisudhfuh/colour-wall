# `marketing/` — read this first

This directory holds **all marketing-automation outputs and config** for The Colour Wall. Nothing in here is imported by the Next.js build. Nothing in here is auto-published.

## Layout

```
marketing/
├── config/                          ← human-edited reference files
│   ├── brand.md                     voice, do/don't, tone references
│   ├── audience.md                  personas, channels, main vs CW account rules
│   └── claims.md                    the ONLY facts allowed in marketing copy
├── plans/                           ← /growth-plan output (drafts)
├── seo/
│   ├── ideas.md                     backlog of SEO topics
│   └── drafts/                      ← /seo-page output (DRAFT- files)
├── tiktok/
│   ├── main-account-soft/           ← /tiktok-batch main output (soft mentions only)
│   └── colourwall-account/          ← /tiktok-batch CW output
├── outreach/
│   ├── targets.md                   curated targets list
│   └── drafts/                      ← /outreach-pack output
└── reviews/
    ├── _inputs/                     where Austin drops raw metrics
    └── (YYYY-MM-DD review files)    ← /growth-review output
```

## Rules

The single source of truth for safety rules is `.claude/MARKETING_RULES.md`. Read it before touching anything here.

Short version:
- All drafts are **markdown only**, prefixed `DRAFT-`, with `status: draft` in the frontmatter.
- Drafts are **not wired into routes**. Austin manually copies approved SEO content into `app/` when he's ready.
- No external posting. No email. No API calls. Ever.
- No mention of The Million Wall in any draft (held back deliberately).
- Every factual claim must trace to `marketing/config/claims.md`.

## Commands

Available slash commands (from `.claude/commands/`):

| Command | Output location |
| ------- | --------------- |
| `/growth-plan` | `marketing/plans/<date>-growth-plan.md` |
| `/seo-page <query>` | `marketing/seo/drafts/DRAFT-<slug>.md` |
| `/tiktok-batch <main\|colourwall\|both> [count]` | `marketing/tiktok/<account>/DRAFT-<date>-batch.md` |
| `/outreach-pack [count]` | `marketing/outreach/drafts/DRAFT-<date>-pack.md` |
| `/growth-review` | `marketing/reviews/<date>-review.md` |

Every command runs `npm run typecheck` and `npm run build` before declaring done, and stops at "files written" — no auto-commit, no auto-push, no auto-branch.
