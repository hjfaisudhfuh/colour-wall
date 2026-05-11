Debug the issue described by the user. Argument `$ARGUMENTS` is the bug
description if provided.

Follow this order strictly. Skipping steps creates regressions.

1. **Reproduce / verify the bug.** Read the user's description carefully. If
   anything is ambiguous, ask one targeted question before reading code.
2. **Use the file index in CLAUDE.md** to identify the most likely affected
   file(s). Read those files specifically — don't fish across the codebase.
3. **Form a SINGLE hypothesis.** State it explicitly:
   *"I think the bug is X, caused by Y, fixable by Z."*
4. **Propose the fix:**
   - Exact file(s)
   - Exact change (or pseudocode)
   - Risk level
   - Payment / webhook touch verdict (must be NO unless the bug is literally
     in those files AND the user has acknowledged the touch in advance)
5. **Wait for explicit approval.**
6. **Implement.**
7. **Run `/precommit`** and show the result.
8. **Show the diff. Wait for explicit commit approval.**

## Reproduction realism

- If the bug is production-only and not reproducible locally, say so.
- Ask for the exact failing data:
  - Vercel function log line (especially `[checkout] …` / `[webhook] …` shapes)
  - Browser console error
  - Network request that failed (URL, method, status, body if available)
  - URL the user was on
  - Steps to reproduce
- Do NOT guess at root cause without that data.
- Do NOT propose "just retry" or "add a try/catch" as a fix unless the bug
  IS a missing error handler.

## When the cause is configuration, not code

If the most-likely cause is configuration (env vars, Stripe mode, Supabase
state, Vercel dashboard setting), say so explicitly and do NOT write code.
Recommend the dashboard step the user needs to take.

## Hard rules during bug-fix

- Never weaken signature verification in the webhook.
- Never bypass the `.select()` pattern in `/api/checkout`'s placeholder swap.
- Never weaken RLS on `squares` or `checkout_batches`.
- Never alter the atomic-transaction shape of `reserve_squares_batch`.
- If a fix proposal requires touching any of the above, push back and ask
  the user to confirm they want to take that risk first.
