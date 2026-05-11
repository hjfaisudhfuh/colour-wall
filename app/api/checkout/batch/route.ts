import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { batchCheckoutBodySchema } from "@/lib/validation";
import {
  PRICE_CENTS,
  RESERVATION_MINUTES,
  MAX_BATCH_SIZE,
} from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function originFromRequest(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// Diagnostic-only: returns booleans, never values. Safe to log in production.
function envPresence() {
  return {
    has_stripe_secret: Boolean(process.env.STRIPE_SECRET_KEY),
    stripe_key_mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
      ? "live"
      : process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
        ? "test"
        : "missing-or-malformed",
    has_supabase_url: Boolean(process.env.SUPABASE_URL),
    has_supabase_service_role_key: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    has_base_url: Boolean(process.env.NEXT_PUBLIC_BASE_URL),
  };
}

export async function POST(req: NextRequest) {
  // Outer try/catch ensures we ALWAYS return JSON to the client. Without this,
  // a throw from getServiceClient() / getStripe() (e.g. missing env vars)
  // bubbles up to the runtime and the client sees an empty/HTML 500.
  try {
    const env = envPresence();
    if (
      !env.has_stripe_secret ||
      !env.has_supabase_url ||
      !env.has_supabase_service_role_key
    ) {
      console.error("[checkout/batch] missing required env", env);
      return NextResponse.json(
        { error: "server misconfigured" },
        { status: 500 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
    }

    const parsed = batchCheckoutBodySchema.safeParse(body);
    if (!parsed.success) {
      console.warn("[checkout/batch] invalid input", {
        issues: parsed.error.issues,
      });
      return NextResponse.json(
        { error: "invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { coords, color, name, link, message } = parsed.data;

    // Defense-in-depth dedupe (client should not submit duplicates, but a
    // duplicate would cause the on-conflict to no-op for the second row
    // while we'd still charge Stripe for the higher quantity).
    const seen = new Set<string>();
    for (const c of coords) {
      const key = `${c.x},${c.y}`;
      if (seen.has(key)) {
        return NextResponse.json(
          { error: "duplicate coordinates" },
          { status: 400 },
        );
      }
      seen.add(key);
    }

    const cleanName = name && name.length > 0 ? name : null;
    const cleanLink = link && link.length > 0 ? link : null;
    const cleanMessage = message && message.length > 0 ? message : null;

    const totalCents = PRICE_CENTS * coords.length;
    const batchId = randomUUID();

    console.log("[checkout/batch] request", {
      square_count: coords.length,
      max: MAX_BATCH_SIZE,
      color,
      message_length: cleanMessage?.length ?? 0,
      has_name: cleanName !== null,
      has_link: cleanLink !== null,
      batch_id: batchId,
      env,
    });

    const supabase = getServiceClient();
    const stripe = getStripe();
    const origin = originFromRequest(req);

    // 1. Create the Stripe session FIRST. Reasons we use the Stripe-first
    //    pattern here (rather than the placeholder-swap pattern in
    //    /api/checkout): no swap means no .select()-counts-rows trick, and
    //    cleanup on RPC failure is the same one-line stripe.sessions.expire
    //    we'd need anyway.
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: PRICE_CENTS,
              product_data: {
                name: `The Colour Wall — ${coords.length} ${coords.length === 1 ? "square" : "squares"}`,
              },
            },
            quantity: coords.length,
          },
        ],
        success_url: `${origin}/success?batch=${batchId}`,
        cancel_url: `${origin}/cancel`,
        // Stripe minimum is 30 minutes; matches DB pending_until.
        expires_at: Math.floor(Date.now() / 1000) + RESERVATION_MINUTES * 60,
        metadata: {
          batch_id: batchId,
          square_count: String(coords.length),
        },
      });
    } catch (e) {
      const stripeErr = e as {
        type?: string;
        code?: string;
        message?: string;
        statusCode?: number;
      };
      console.error("[checkout/batch] stripe session create failed", {
        type: stripeErr.type ?? null,
        code: stripeErr.code ?? null,
        statusCode: stripeErr.statusCode ?? null,
        message: stripeErr.message ?? String(e),
        origin,
      });
      return NextResponse.json(
        { error: "payment provider unavailable" },
        { status: 502 },
      );
    }

    // 2. Reserve all squares atomically. If any one is unavailable, the RPC
    //    raises and the whole transaction rolls back — no partial state.
    const { error: reserveErr } = await supabase.rpc(
      "reserve_squares_batch",
      {
        p_coords: coords,
        p_color: color,
        p_name: cleanName,
        p_link: cleanLink,
        p_feeling_category: null,
        p_message: cleanMessage,
        p_batch_id: batchId,
        p_session_id: session.id,
        p_unit_price_cents: PRICE_CENTS,
        p_minutes: RESERVATION_MINUTES,
      },
    );

    if (reserveErr) {
      // PostgrestError fields: message, code, details, hint.
      // Specific codes we care about: 'P0001' (raise exception in plpgsql)
      // surfaces as a custom message — square_unavailable_at_X_Y.
      console.error("[checkout/batch] reserve_squares_batch failed", {
        message: reserveErr.message,
        code: reserveErr.code,
        details: reserveErr.details,
        hint: reserveErr.hint,
      });

      // Always expire the orphan Stripe session.
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireErr) {
        console.error(
          "[checkout/batch] failed to expire orphan stripe session:",
          expireErr,
        );
      }

      const userFacing = reserveErr.message?.includes("square_unavailable")
        ? "one or more squares are no longer available"
        : "reservation failed";
      const status = reserveErr.message?.includes("square_unavailable")
        ? 409
        : 500;
      return NextResponse.json(
        { error: userFacing, code: reserveErr.code ?? null },
        { status },
      );
    }

    if (!session.url) {
      // Belt-and-braces. Should never happen.
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireErr) {
        console.error(
          "[checkout/batch] failed to expire stripe session missing url:",
          expireErr,
        );
      }
      // RPC succeeded but no URL — clean up the rows.
      await supabase.from("squares").delete().eq("batch_id", batchId);
      await supabase.from("checkout_batches").delete().eq("id", batchId);
      return NextResponse.json(
        { error: "stripe session missing url" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: session.url,
      batch_id: batchId,
      total_cents: totalCents,
    });
  } catch (e) {
    const info =
      e instanceof Error
        ? { name: e.name, message: e.message, stack: e.stack }
        : { value: String(e) };
    console.error("[checkout/batch] unhandled error", info);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
