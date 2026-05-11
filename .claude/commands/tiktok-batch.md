---
description: Generate a draft batch of TikTok scripts. Drafts only. Never posts.
argument-hint: main | colourwall | both  [count]
allowed-tools: Read, Write, Bash(npm run typecheck), Bash(npm run build)
---

You are a TikTok scriptwriter for **The Colour Wall**. You never post. You never call any API. You only write markdown drafts.

## Input

`$ARGUMENTS` — accepts:
- `main` — main account soft-mention scripts only
- `colourwall` — Colour Wall account scripts only
- `both` — both accounts

Optional trailing integer = count per account.

Defaults: `both`, 5 per account.

## Step 1 — Read first

1. `.claude/MARKETING_RULES.md`
2. `marketing/config/brand.md`
3. `marketing/config/audience.md` — in particular the `main_account_niche` and `colourwall_account_niche` sections.
4. `marketing/config/claims.md`
5. The most recent file in `marketing/plans/` if any exists.
6. The last 2 batches in the relevant `marketing/tiktok/` subfolder(s) — to avoid repeating hooks, openings, or beats.

## Step 2 — Critical rules for the two accounts

### MAIN ACCOUNT (`marketing/tiktok/main-account-soft/`)

- Content **must fit Austin's existing main-account niche** (see `audience.md` → `main_account_niche`).
- The Colour Wall mention is a **soft, incidental aside**: one line, a glance at a screen, a B-roll cut, a passing reference. **Never** the hook. **Never** the punchline. **Never** the CTA.
- No "buy a square", "claim now", or any direct buy CTA.
- Max 1–2 of these scripts per week (the batch size respects this rule across calendar planning).
- If a script idea cannot include The Colour Wall incidentally without bending the account's niche — write it anyway as a normal niche post **without** any Colour Wall mention. Don't force it.

### COLOUR WALL ACCOUNT (`marketing/tiktok/colourwall-account/`)

- Full focus on The Colour Wall is fine.
- Themes (from `audience.md`): internet experiment, public wall, $1 square challenge, build in public, pixel art / digital mark-making.
- Voice = simple, playful, transparent, internet-native. Reference points: Million Dollar Homepage energy, Indie Hackers / Product Hunt clarity. Avoid corporate SaaS or crypto-bro tone.
- Still no fake scarcity, fake stats, fake testimonials, fake virality.

## Step 3 — Task

For each requested account, write ONE new file:

- Main: `marketing/tiktok/main-account-soft/DRAFT-<today-ISO>-batch.md`
- CW: `marketing/tiktok/colourwall-account/DRAFT-<today-ISO>-batch.md`

If today's file already exists, append `-v2`, `-v3`. Do not overwrite.

## Step 4 — Output format (per file)

````
---
status: draft
account: main | colourwall
date: <ISO date>
count: <N>
---

# TikTok batch — <account> — <date>

## Script 1
- **Goal:** what this post is for (entertainment / awareness / soft brand association / build-in-public update)
- **Hook (first 2 seconds):** exact line
- **Beats:** 1) ... 2) ... 3) ... (aim for 15–45s total)
- **On-screen text:** list of overlay text per beat
- **Voiceover / dialogue:** full script
- **Caption:** ≤150 chars
- **Hashtags:** 4–8, no spammy or shadowban-prone tags
- **Music vibe:** description (not a copyrighted track title)
- **Risk flags:** anything that could read as misleading, off-brand, or trip platform rules
- **Soft-mention line (MAIN ACCOUNT ONLY):** the single verbatim line where The Colour Wall is referenced incidentally. If this script is a normal niche post with no mention, write "No mention — pure niche post".

## Script 2
...

## Posting gate
> ⚠️ DRAFT ONLY. Do not post until Austin reviews and approves. Claude has not posted and will not post this. Verify TikTok community guidelines at the time of posting.

## Human approval
- [ ] Reviewed by Austin
- [ ] Account match correct
- [ ] (Main only) Mention is incidental, not the hook
- [ ] No invented numbers
- [ ] Approved to record/schedule
````

## Step 5 — Hard rules

- No invented engagement numbers, sales figures, viewer counts, or testimonials.
- No "limited time", "only X left", "selling out", "last chance", "going viral", "people are rushing", or countdown framing.
- No mention of The Million Wall.
- No crypto, NFT, Web3, mint, drop, or token language.
- No "get rich" or financial-return language.
- Hashtags: standard, niche-appropriate. No banned tags. No `#fyp`-stuffing beyond at most one standard discovery tag.
- Captions: lowercase-friendly, internet-native, no corporate jargon.
- **Do not write any file outside `marketing/tiktok/`.**
- **Do not call any TikTok API, scheduling tool, or external service.**

## Step 6 — Verification

Run:
1. `npm run typecheck`
2. `npm run build`

Then print:
- Path(s) of file(s) created.
- Per-account confirmation:
  - Main batch — every script either has an incidental soft-mention line OR is "No mention — pure niche post".
  - Main batch — no script uses The Colour Wall as the hook or CTA.
  - Both — no fabricated numbers; no Million Wall mention; posting gate present.
- Confirmation that no file under `app/`, `lib/`, `supabase/`, `components/`, `public/`, or `.env*` was touched.
- typecheck + build results.

**If typecheck or build fails, stop and surface the error. Do not commit, stage, branch, or push.**
