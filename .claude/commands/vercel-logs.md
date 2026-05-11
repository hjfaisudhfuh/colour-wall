The user pastes a Vercel function log line or block (in `$ARGUMENTS` or as
the next message). Identify the root cause from the structured fields and
propose the precise fix. Do not change code without approval.

## Known structured log patterns in this codebase

| Log prefix | Route | Most likely cause |
|---|---|---|
| `[checkout] missing required env` | `/api/checkout` | Env var not set, or env added after deploy without a redeploy |
| `[checkout] reserve_square rpc error` with code `PGRST202` | `/api/checkout` | Migration 0002 not applied to production Supabase |
| `[checkout] reserve_square rpc error` with code `42501` | `/api/checkout` | Wrong Supabase key (using anon instead of service-role) |
| `[checkout] stripe session create failed` with `type: StripeAuthenticationError` | `/api/checkout` | Wrong `STRIPE_SECRET_KEY` (or test/live mode mismatch) |
| `[checkout] stripe session create failed` with `type: StripeInvalidRequestError` mentioning `success_url` | `/api/checkout` | `NEXT_PUBLIC_BASE_URL` malformed or missing |
| `[checkout] update session_id matched 0 rows` | `/api/checkout` | Placeholder swap couldn't find the row — race condition or DB state issue. The route correctly expires the Stripe session and returns 500. |
| `[checkout/batch] reserve_squares_batch failed` with `square_unavailable_at_*_*` | `/api/checkout/batch` | Normal: another user took one of the selected cells while this user was deciding. Route returns 409. |
| `[webhook] signature verification failed` | `/api/stripe/webhook` | `STRIPE_WEBHOOK_SECRET` mismatch. **#1 cause: test ↔ live mode mix between Stripe Dashboard webhook and Vercel env.** |
| `[webhook] no matching pending row` | `/api/stripe/webhook` | Either idempotent retry (harmless) OR the row was never created by checkout. The diagnostic dump shows which — look at `row_for_xy` and `batch_for_id`. |
| `[webhook] update error` | `/api/stripe/webhook` | Supabase write failed mid-claim. Stripe will retry on 500. |

## For each error

1. Identify the pattern from the prefix and the structured fields.
2. State the most likely root cause.
3. Propose the exact fix — and crucially, state whether the fix is:
   - **Vercel dashboard** (env var change, requires redeploy)
   - **Supabase** (run a migration, fix a permission, check RPC signature)
   - **Stripe Dashboard** (webhook endpoint config, key mode)
   - **Code** (propose change, wait for approval — and remember
     the `/api/stripe/webhook` security model is sacrosanct)

## What never to propose

- Weakening signature verification ("just remove the check")
- Bypassing the `.select()` pattern in `/api/checkout`
- Disabling RLS on `squares` / `checkout_batches`
- Making the webhook accept events without payment confirmation

If the log doesn't match a known pattern, say so and ask for surrounding
log lines (timestamps + neighbouring entries). Don't invent a diagnosis.
