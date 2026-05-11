---
description: Draft one SEO landing page as a markdown file in marketing/seo/drafts/. Not a live route.
argument-hint: <target-query-or-topic>
allowed-tools: Read, Write, Bash(npm run typecheck), Bash(npm run build)
---

You are drafting a single SEO page for **The Colour Wall**.

## Input

`$ARGUMENTS` — the target search query or topic.

If `$ARGUMENTS` is empty: list the 5 highest-priority candidate queries from `marketing/seo/ideas.md` (with one-line rationale each) and STOP. Do not write any file.

## Step 1 — Read first

1. `.claude/MARKETING_RULES.md`
2. `marketing/config/brand.md`
3. `marketing/config/audience.md`
4. `marketing/config/claims.md`
5. `marketing/seo/ideas.md`
6. `app/layout.tsx` and `app/page.tsx` — **read only, for voice grounding. DO NOT EDIT.**
7. List filenames under `app/` (read-only) so internal-link suggestions reference real routes.

## Step 2 — Task

Create `marketing/seo/drafts/DRAFT-<kebab-slug>.md`. If the file already exists, append `-v2`, `-v3`, etc. **Do not overwrite.**

## Step 3 — Output format

````
---
status: draft
target_query: "<query>"
search_intent: informational | commercial | transactional
slug: <kebab-slug>
meta_title: "<≤60 chars>"
meta_description: "<≤155 chars>"
canonical: https://colour-wall.vercel.app/<slug>
created: <ISO date>
---

# <H1 — must differ from meta_title, include target query naturally>

## Intro (50–90 words)
Hook + what the page answers. Voice = simple, playful, transparent, internet-native. No urgency, no fake scarcity.

## <H2 section>
...

## <H2 section>
...

## How The First Wall works
Plain explanation, only facts from claims.md:
- 100×100 grid = 10,000 squares
- $1 per square
- Pick a colour, leave a mark
- (Other facts only if in claims.md)

## FAQ
4–8 questions. Real and useful. No keyword stuffing.

## Internal links (suggestions, not embedded)
3–6 anchor text → target URL pairs. Targets must be real existing routes in `app/`.

## JSON-LD
```json
{ ... appropriate schema, validates with schema.org ... }
```

## Open questions for human review
Anything you almost invented — flag it here instead of fabricating.

## Claim trace
List each factual claim in the draft and the corresponding line in `marketing/config/claims.md`. If a claim isn't in claims.md, replace it with `[CLAIM NEEDED]`.

## Human approval
- [ ] Reviewed by Austin
- [ ] Meta title/description within limits
- [ ] JSON-LD validates
- [ ] Internal links point to real routes
- [ ] Approved to copy into app/ manually
````

## Step 4 — Hard rules

- No invented stats, sales numbers, user counts, testimonials, or press mentions.
- No mention of The Million Wall.
- No crypto, NFT, "investment", "get rich", or financial-return language.
- No corporate SaaS jargon (see `.claude/MARKETING_RULES.md` §3).
- Word count: 700–1500 unless the query clearly needs less. Be honest if it should be shorter.
- Reading level: GCSE-level prose. No fluff.
- **Do not create or modify any file under `app/`, `components/`, `lib/`, `public/`, `supabase/`, `.env*`, or `next.config.*`.**
- Do not modify sitemap or robots files.
- The draft is markdown only. It does not become a route until Austin manually copies content into `app/`.

## Step 5 — Verification

Run:
1. `npm run typecheck`
2. `npm run build`

Then print:
- Path of the file created.
- Confirmation that only one new file under `marketing/seo/drafts/` was written.
- Confirmation that no `app/`, `lib/`, `supabase/`, `components/`, `public/`, `next.config.*`, sitemap, or robots file was touched.
- typecheck + build results.

**If typecheck or build fails, stop and report the error. Do not commit, stage, branch, or push.**
