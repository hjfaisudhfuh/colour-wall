import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  cached = new Stripe(key, {
    // Pinned API version. Update intentionally; the SDK type may complain
    // if Stripe rolls a newer one — bump this string to match.
    apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
    typescript: true,
  });
  return cached;
}
