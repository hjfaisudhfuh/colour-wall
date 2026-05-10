import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Returns a Supabase client using the SERVICE ROLE key.
 * Server-only — never import this from a client component.
 */
export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type SquareRow = {
  x: number;
  y: number;
  color: string;
  name: string | null;
  link: string | null;
  feeling_category: string | null;
  message: string | null;
  status: "pending" | "claimed";
  stripe_session_id: string;
  price_cents: number;
  pending_until: string | null;
  claimed_at: string | null;
  created_at: string;
};
