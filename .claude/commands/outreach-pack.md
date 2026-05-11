---
description: Draft a pack of community posts and backlink pitches. No sending, no posting, no fetching.
argument-hint: [count]
allowed-tools: Read, Write, Bash(npm run typecheck), Bash(npm run build)
---

You are drafting outreach material for **The Colour Wall**. You do not post. You do not send. You do not DM. You do not email. You do not fetch live community rules. Everything you produce is a markdown draft for Austin to review.

## Input

`$ARGUMENTS` — optional integer. Default: 6 community posts + 4 backlink/guest pitches.

## Step 1 — Read first

1. `.claude/MARKETING_RULES.md`
2. `marketing/config/brand.md`
3. `marketing/config/audience.md`
4. `marketing/config/claims.md`
5. `marketing/outreach/targets.md`
6. The most recent file in `marketing/plans/` if any exists.

## Step 2 — Task

Write a new file at `marketing/outreach/drafts/DRAFT-<today-ISO>-pack.md`. If it exists, append `-v2`, `-v3`.

## Step 3 — Output format

````
---
status: draft
created: <ISO date>
---

# Outreach pack — <date>

## A. Community posts

### Post 1
- **Target:** <community name — must be in targets.md>
- **Why relevant:** one sentence
- **Community rules to respect:** bullet list, BASED ONLY on what targets.md says about this community. If targets.md says "RULES UNKNOWN", write "RULES UNKNOWN — Austin to verify before posting" and DO NOT guess.
- **Angle:** show / ask / build-in-public / case study / question
- **Title:** exact title
- **Body:** exact post body, ready to paste
- **Self-promotion ratio note:** flag if this post is overtly promotional vs. value-first
- **Risk flags:** anything that could trip community norms (e.g. self-promo subs, repost rules, flair requirements)

### Post 2
...

## B. Backlink / guest-post pitches

### Pitch 1
- **Target site / author:** <from targets.md>
- **Why a fit:** one sentence
- **Angle:** story / data / opinion / build-in-public / curiosity
- **Subject line (if email/DM):** exact
- **Body:** exact, ready to paste — **but DO NOT send. Austin sends manually.**
- **Suggested URL to backlink:** must be `https://colour-wall.vercel.app` or a real existing page in the repo

### Pitch 2
...

## C. Logging table (blank, for Austin to fill)

| Target | Date sent | Channel | Response | Result |
| ------ | --------- | ------- | -------- | ------ |
|        |           |         |          |        |

## Human approval
- [ ] Reviewed by Austin
- [ ] Community rules manually verified for each target
- [ ] No fabricated personal stories
- [ ] No invented numbers
- [ ] Approved to post/send manually
````

## Step 4 — Hard rules

- Every claim about The Colour Wall must trace to `marketing/config/claims.md`. If a claim is missing, write `[CLAIM NEEDED]`.
- No fake personal stories. No fabricated "I bought a square and..." narratives. No invented testimonials.
- Each pitch must be **specific to its target**. No mass-DM templates with `[Name]` placeholders.
- No mention of The Million Wall.
- No `mailto:` execution, no scripts, no API calls, no fetching live subreddit/site rules.
- If a target's rules aren't in `targets.md`, output `RULES UNKNOWN — Austin to verify before posting`. Do not guess.
- Voice = simple, playful, transparent, internet-native. Avoid SaaS/crypto/get-rich tone.
- No fake scarcity, urgency, or virality language.

## Step 5 — Verification

Run:
1. `npm run typecheck`
2. `npm run build`

Then print:
- Path of the file created.
- Confirmation that every target in the draft appears in `targets.md` (or is flagged "needs adding to targets.md").
- Confirmation that no invented testimonials or stats appear anywhere.
- Confirmation that no Million Wall references appear.
- Confirmation that every post body is marked draft / not-yet-posted.
- Confirmation that no file under `app/`, `lib/`, `supabase/`, `components/`, `public/`, or `.env*` was touched.
- typecheck + build results.

**If typecheck or build fails, stop and surface the error. Do not commit, stage, branch, or push.**
