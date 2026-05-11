Run the pre-commit verification ritual for The Colour Wall. Output a single
PASS/FAIL summary at the top, then per-step details. Do NOT commit anything —
that is always a separate, explicit step.

Run these in parallel where possible:

1. `git status` — list all changed files
2. `git diff --cached --name-only` — show staged files (likely empty)
3. Confirm 0-line diff on the payment/security routes:
   - `git diff app/api/checkout/route.ts | wc -l`
   - `git diff app/api/checkout/batch/route.ts | wc -l`
   - `git diff app/api/stripe/webhook/route.ts | wc -l`
   Any non-zero is a hard FAIL unless the user explicitly asked to touch that file.
4. Confirm `.env.local` is ignored: `git check-ignore -v .env.local`
5. Confirm only `.env.local.example` is tracked: `git ls-files | grep -iE '(^|/)\.env'`
6. Secret scan across modified + new files:
   `grep -RInE 'sk_(test|live)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|SUPABASE_SERVICE_ROLE_KEY\s*=\s*[A-Za-z0-9]{8,}'`
   against `app components lib` (or whichever dirs the changes touched)
7. `npm run typecheck`
8. `npm run build` (show last ~22 lines including the route table)

Stop and report at the first FAIL — don't proceed to later steps.

Reply format:
- PASS/FAIL header
- Per-step results
- If PASS: file inventory + suggested commit message (do NOT commit unless user says so)
- If FAIL: which step failed + relevant snippet + suggested remediation
