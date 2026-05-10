# The Colour Wall

A public canvas made one tiny square at a time. Anyone can claim a square for $1, pick a colour, and leave a message, name, link — or claim multiple squares to build something bigger (initials, pixel art, a tribute, a flag).

> Leave your colour on the internet.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS, Inter + Instrument Serif (next/font)
- Supabase Postgres
- Stripe Checkout + verified webhook
- Deployed on Vercel

## Local setup

1. Copy env template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Create a Supabase project and apply the migrations in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_feelings.sql`
   - `supabase/migrations/0003_broaden_categories.sql`

   Run them in the SQL editor or via `supabase db push`. Copy the project URL and **service role** key into `.env.local`.

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

6. Visit http://localhost:3000, scroll to the wall, click an empty square, pick a colour and (optionally) a vibe + message, pay with test card `4242 4242 4242 4242`. The webhook should mark the square claimed within a few seconds.

## Production (Vercel)

1. Push to GitHub, import in Vercel.
2. Set the same env vars in Vercel project settings (use **live** Stripe keys for production).
3. Add a webhook in Stripe Dashboard pointing to `https://<your-domain>/api/stripe/webhook`, subscribed to `checkout.session.completed` and `checkout.session.expired`. Copy the live `whsec_...` to Vercel.
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain.
5. Apply all three Supabase migrations on the production database **before** deploying the new app code (the `reserve_square` signature added by `0002` is required by the new `/api/checkout`).

## Architecture

- `app/page.tsx` — server component, fetches claimed cells, composes the landing.
- `app/api/squares/route.ts` — `GET` claimed cells (public, RLS-filtered).
- `app/api/checkout/route.ts` — `POST` reserves a cell (atomic Postgres RPC) and creates a Stripe Checkout Session. Persists the real Stripe `session.id` before redirecting; expires + cleans up if that swap fails.
- `app/api/stripe/webhook/route.ts` — `POST` Stripe-only. Verifies signature, marks `pending` → `claimed`. On no-match it logs structured diagnostics (without leaking the stored session id).
- `components/Grid.tsx` + `ClaimDialog.tsx` + `SquarePopover.tsx` — wall + claim modal + per-square popover.
- `components/Hero.tsx` + `HowItWorks.tsx` + `LatestMarks.tsx` + `WhyOneDollar.tsx` + `TikTokHook.tsx` + `Footer.tsx` — landing sections.

## Schema notes

The `squares` table carries optional `feeling_category` and `message` columns. The column name is historical — `feeling_category` is now used as a generic optional "vibe" tag (Art / Tribute / Shout-out / Memory / Just for fun / Love / Happy / Hope / etc.). Renaming the column would be destructive; the user-facing label is "Vibe (optional)" everywhere.

## Invariants

- The frontend cannot mark a square claimed. Only the verified Stripe webhook can.
- `(x, y)` is the primary key — duplicate claims are physically impossible.
- Reservations expire after 30 minutes; expired pending rows are overwritten by the next reservation.
- Webhook updates are idempotent (`WHERE status='pending'` matches at most once).
- The placeholder→real `session.id` swap in `/api/checkout` uses `.select()` and treats a 0-row update as a hard failure (expires the Stripe session, frees the cell).
