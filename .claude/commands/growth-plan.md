---
description: Produce a 4-week marketing growth plan for The Colour Wall (draft only, no posting).
allowed-tools: Read, Write, Bash(npm run typecheck), Bash(npm run build)
---

You are the growth strategist for **The Colour Wall** — a 100×100 public canvas (10,000 squares at $1 each) at https://colour-wall.vercel.app. Current wall: **The First Wall**.

## Step 1 — Read these files first (in order)

1. `.claude/MARKETING_RULES.md` — obey every rule. This file overrides anything below if there is a conflict.
2. `marketing/config/brand.md`
3. `marketing/config/audience.md`
4. `marketing/config/claims.md`
5. The most recent file in `marketing/reviews/` if any exists.
6. The most recent file in `marketing/plans/` if any exists (for continuity).

## Step 2 — Task

Write a NEW file at `marketing/plans/<today-ISO>-growth-plan.md` (e.g. `2026-05-11-growth-plan.md`). **Do not overwrite an existing plan.** If today's plan already exists, append `-v2`, `-v3`, etc.

## Step 3 — Output format (markdown, exact structure)

```
---
status: draft
created: <ISO date>
horizon: 4 weeks
---

# Growth Plan — <date>

## 1. Current state (facts only)
Pull only from claims.md. For each fact, cite the line. If something is unknown, write "Unknown — not in claims.md".

## 2. Objectives (this 4-week window)
3–5 measurable goals. Each goal: target, metric, why, confidence (High/Medium/Low).

## 3. Channel plan

### 3a. SEO
4–8 page ideas. For each: target query | search intent | rough word count | priority (H/M/L) | one-line rationale.

### 3b. TikTok — main account (soft mentions only)
Max 1–2 posts/week. Each idea must fit the main account niche described in audience.md. The Colour Wall mention must be incidental — never the hook, never the CTA.

### 3c. TikTok — Colour Wall account
3–5 posts/week. Hook archetypes, content pillars, no fake stats, no Million Wall.

### 3d. Outreach / backlinks
5–10 communities or sites. For each: why relevant, post angle, risk level (Low/Med/High).

## 4. Weekly schedule
A 4-row table: Week | SEO | TikTok-main | TikTok-CW | Outreach.

## 5. Risks & traps
What could make this look spammy, off-brand, or trip platform rules.

## 6. Metrics to watch
Concrete numbers, sources (e.g. "Vercel Analytics dashboard"), how Austin will read them.

## 7. Confidence
For each major bet in §2 and §3: High / Medium / Low + one-line reason.

## Human approval
- [ ] Reviewed by Austin
- [ ] SEO ideas approved
- [ ] TikTok-main themes approved (incidental mention only)
- [ ] TikTok-CW themes approved
- [ ] Outreach targets approved
- [ ] Approved to proceed to drafting
```

## Step 4 — Hard rules

- No invented numbers, users, sales, or testimonials.
- Do NOT mention The Million Wall.
- Do NOT propose anything requiring posting, emailing, DMing, or external API calls.
- Main-account TikTok ideas: mention must be incidental, never the hook.
- All claims about The Colour Wall must trace to `marketing/config/claims.md`.
- Voice must match `marketing/config/brand.md` (simple, playful, transparent, internet-native).

## Step 5 — Verification (run before declaring done)

Run, in order:
1. `npm run typecheck`
2. `npm run build`

Then print:
- The full path of the file you created.
- Confirmation that no file outside `marketing/plans/` was created or modified.
- Confirmation that no file in `app/`, `lib/`, `supabase/`, `components/`, `public/`, or `.env*` was touched.
- typecheck result (pass/fail + output)
- build result (pass/fail + output)

**If typecheck or build fails, do not claim success. Stop and surface the error.**

**Do not commit. Do not stage. Do not push. Do not branch.** Austin will review and stage manually.
