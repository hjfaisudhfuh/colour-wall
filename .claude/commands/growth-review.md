---
description: Produce a growth review from manually-supplied metrics. Read-only on past plans. Never fetches live data.
allowed-tools: Read, Write, Bash(npm run typecheck), Bash(npm run build)
---

You are auditing **The Colour Wall**'s marketing performance. You read manually-supplied metrics. You **never** fetch live data from Stripe, Supabase, Vercel, TikTok, Google Search Console, or any other API.

## Step 1 — Read first

1. `.claude/MARKETING_RULES.md`
2. `marketing/config/brand.md`
3. `marketing/config/audience.md`
4. `marketing/config/claims.md`
5. The most recent file in `marketing/plans/`
6. The most recent 3 files in `marketing/reviews/` (for trend continuity)
7. Any file under `marketing/reviews/_inputs/` that Austin has just created with metrics

## Step 2 — Input check

Austin will either:
- Paste metrics directly into the chat, OR
- Drop a file into `marketing/reviews/_inputs/` with the raw metrics

**If no metrics are present in chat or in `marketing/reviews/_inputs/`:** ask Austin to paste them or save them to `marketing/reviews/_inputs/`. Then STOP. Do not invent metrics. Do not estimate. Do not fetch.

## Step 3 — Task

Write a new file at `marketing/reviews/<today-ISO>-review.md`. If today's review exists, append `-v2`, `-v3`. Reviews are append-only — **never edit past reviews.**

## Step 4 — Output format

````
---
status: draft
created: <ISO date>
period_covered: <start> → <end>
---

# Growth review — <date>

## 1. Inputs (verbatim)
Paste the metrics Austin supplied, unmodified, in a fenced code block. Cite the source for each metric line (e.g. "Vercel Analytics dashboard, 2026-05-11", "TikTok analytics export").

## 2. Plan vs reality
A table covering each objective in the most recent plan:

| # | Objective | Target | Actual | Delta | Notes |
| - | --------- | ------ | ------ | ----- | ----- |

If an objective has no matching actual in the inputs, write "Not measured — needs metric next period".

## 3. What worked
Bullet list. Each bullet must cite a specific metric line from §1. If you cannot cite, do not include it.

## 4. What didn't
Same rule. Be strict. If a target was missed, say so plainly.

## 5. Hypotheses
For each underperforming area: 1–3 hypotheses, ranked by plausibility. Each hypothesis:
- One-line claim
- Why plausible
- Confidence: High / Medium / Low
- What would falsify it

## 6. Next 1-week adjustments
Concrete, small, reversible. Examples: "shift 2 TikTok-CW posts from <theme A> to <theme B>", "pause outreach to <community> until we verify rules". No new builds. **No Million Wall.** No posting commitments.

## 7. Things to escalate to Austin
Anything needing a human call: legal, brand, account safety, payment, platform terms, or anything outside the marketing scope.

## Human approval
- [ ] Reviewed by Austin
- [ ] Inputs match what was supplied
- [ ] Hypotheses ranked with confidence
- [ ] Adjustments approved for next plan
````

## Step 5 — Hard rules

- Be strict. If a goal was missed, state the miss in plain language.
- No invented metrics. No smoothed numbers. No extrapolations beyond what was provided.
- Do not edit any plan file. Reviews are append-only.
- Do not mention The Million Wall.
- Do not propose any action that requires posting, emailing, DMing, or external API calls.
- Do not call out to live data sources.

## Step 6 — Verification

Run:
1. `npm run typecheck`
2. `npm run build`

Then print:
- Path of the file created.
- Confirmation that every claim in §3 and §4 cites a line in §1.
- Confirmation that confidence labels are present on every hypothesis in §5.
- Confirmation that no plan, config, or code file was edited.
- Confirmation that no file under `app/`, `lib/`, `supabase/`, `components/`, `public/`, or `.env*` was touched.
- typecheck + build results.

**If typecheck or build fails, stop and surface the error. Do not commit, stage, branch, or push.**
