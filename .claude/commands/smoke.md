Smoke-test the current production deploy at https://colour-wall.vercel.app.
Optional argument `$ARGUMENTS`: commit hash to verify against (default: most
recent on origin/main). Do NOT change any code.

## Curl-side checks (run these)

1. `git log --oneline -3` and `git rev-list --left-right --count origin/main...HEAD`
   to confirm local matches the expected commit.
2. `curl -sI https://colour-wall.vercel.app/ | head -15` — expect `HTTP/2 200`,
   `x-vercel-cache: MISS` (or HIT), `server: Vercel`, `x-powered-by: Next.js`.
3. Fetch homepage HTML and verify it reflects current code:
   - "Million Wall" mentions present (expect 5+ on homepage)
   - "When it fills" present in WallLaunchBanner copy
   - `<meta property="og:image">` tag present
   - No phrases that have been deliberately removed by recent commits
4. `curl -sI https://colour-wall.vercel.app/opengraph-image` — expect `HTTP/2 200`,
   `content-type: image/png`, long cache.
5. `curl https://colour-wall.vercel.app/privacy` — verify the Vercel Analytics
   disclosure paragraph is present and no over-claim phrases.
6. Look for any `_vercel/insights` script reference in the homepage HTML.
   If absent: NOTE — this may be by design (analytics loads client-side
   post-hydration). Don't escalate to a fix unless the user confirms Network
   tab also shows no `_vercel/insights/*` request.

If the sandbox has no outbound network (curl returns `exit 7` / `HTTP 000`),
report that honestly and skip to the manual checklist below — don't pretend.

## Manual checklist (user runs these — I can't from this sandbox)

- Open production URL in incognito → hero + wall render, no console errors
- Click an empty square → modal opens, close without paying
- Toggle Select multiple → rose rings appear; toggle off again
- DevTools Network tab → reload → look for request to `/_vercel/insights/*`
- Share button on a real success page → Web Share sheet (mobile) or
  clipboard copy fires (desktop)
- Vercel dashboard → Analytics tab → confirm pageview event after 1–2 min
- Paste production URL into Discord/Slack/Twitter draft → OG image preview

Report PASS/FAIL per item. For any FAIL, paste the exact response or
screenshot and I'll diagnose without changing code.
