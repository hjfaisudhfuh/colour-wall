# SEO Ideas — Backlog

Seed list of candidate SEO topics for The Colour Wall. Drafts are produced by `/seo-page <topic>`. All drafts land in `marketing/seo/drafts/` and are NOT wired into live routes until Austin copies them across manually.

Priority key: **H** = high, **M** = medium, **L** = low.
Intent key: **I** = informational, **C** = commercial, **T** = transactional.

| # | Target query | Intent | Priority | Notes |
| - | ------------ | ------ | -------- | ----- |
| 1 | what is the colour wall | I | H | Brand-anchor page. Plain explanation of the product. |
| 2 | million dollar homepage alternative 2026 | I/C | H | High-intent comparison angle. Be respectful of original; do not disparage. |
| 3 | buy a pixel on a public wall | T | M | Long-tail transactional. Match `claims.md` exactly. |
| 4 | $1 square public canvas | I/C | M | Hook on price + format. |
| 5 | leave your mark on the internet | I | M | Emotional/curiosity angle. Keep it honest. |
| 6 | how the colour wall works | I | H | FAQ-style page, helps reduce checkout friction. |
| 7 | public pixel canvas projects | I | L | Roundup-style. Only include real projects; cite them. |
| 8 | tiny internet experiments 2026 | I | L | Build-in-public adjacent. Place The Colour Wall in context, no over-claiming. |
| 9 | $1 pixel project | I/C | M | Variant on the price hook. |
| 10 | collaborative online canvas $1 | I/C | L | Verify search volume before drafting. |

## Topics to AVOID drafting

- Anything implying The Colour Wall is an investment, NFT, token, or speculative asset.
- "Going viral" / "blew up" angles.
- Comparisons that misrepresent another product.
- The Million Wall (held back per `claims.md`).

## Workflow

1. Pick a row. Run `/seo-page <target query>`.
2. Command writes a draft into `marketing/seo/drafts/DRAFT-<slug>.md`.
3. Austin reviews, edits, and only then manually copies content into `app/<route>/page.tsx`.
4. Mark the row done by appending `✅ <date>` to the Notes column.
