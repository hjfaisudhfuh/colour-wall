# Dollar Grid

A 100×100 public grid where anyone can claim a square for $1. Choose a color, optionally add a name + link, pay via Stripe, and the square is yours forever.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase Postgres
- Stripe Checkout + verified webhook
- Deployed on Vercel

## Local setup

1. Copy env template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Create a Supabase project and run the migration in `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`). Copy the project URL and **service role** key into `.env.local`.

3. Create a Stripe account, grab the test secret key (`sk_test_...`), and put it in `.env.local`.

4. Install + run:
   ```bash
   npm install
   npm run dev
   ```

5. In a second terminal, forward Stripe webhook events to local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart `npm run dev`.

6. Visit http://localhost:3000, click an empty square, fill the form, pay with test card `4242 4242 4242 4242`. The webhook should mark the square claimed within a few seconds.

## Production (Vercel)

1. Push to GitHub, import in Vercel.
2. Set the same env vars in Vercel project settings (use **live** Stripe keys for production).
3. Add a webhook in Stripe Dashboard pointing to `https://<your-domain>/api/stripe/webhook`, subscribed to `checkout.session.completed` and `checkout.session.expired`. Copy the live `whsec_...` to Vercel.
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain.

## Architecture

- `app/page.tsx` — server component, fetches claimed cells, renders `<Grid/>`.
- `app/api/squares/route.ts` — `GET` claimed cells (public).
- `app/api/checkout/route.ts` — `POST` reserves a cell (DB upsert with `pending_until`) and creates a Stripe Checkout Session.
- `app/api/stripe/webhook/route.ts` — `POST` Stripe-only. Verifies signature, marks `pending` → `claimed`.
- `components/Grid.tsx` + `ClaimDialog.tsx` + `SquarePopover.tsx` — UI.

## Invariants

- The frontend cannot mark a square claimed. Only the verified Stripe webhook can.
- `(x, y)` is the primary key — duplicate claims are physically impossible.
- Reservations expire after 30 minutes; expired pending rows are overwritten by the next reservation.
- Webhook updates are idempotent (`WHERE status='pending'` matches at most once).
