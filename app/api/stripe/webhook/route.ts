import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  // Verification requires the RAW body string — never parse JSON first.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("webhook signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: "unpaid" });
    }

    const supabase = getServiceClient();

    // Update all pending squares for this session. This naturally handles
    // both the single-square flow (1 row) and the batch flow (N rows) once
    // the unique constraint on stripe_session_id is dropped (migration 0004).
    const { data, error } = await supabase
      .from("squares")
      .update({ status: "claimed", claimed_at: new Date().toISOString() })
      .eq("stripe_session_id", session.id)
      .eq("status", "pending")
      .select("x,y");

    if (error) {
      console.error("[webhook] update error:", error);
      // Returning 500 makes Stripe retry — that's what we want for transient issues.
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    // Side-effect: mark the batch row claimed (audit). Squares table is the
    // source of truth — don't fail the webhook if this errors.
    const { error: batchErr } = await supabase
      .from("checkout_batches")
      .update({ status: "claimed", claimed_at: new Date().toISOString() })
      .eq("stripe_session_id", session.id)
      .eq("status", "pending");
    if (batchErr) {
      console.warn("[webhook] checkout_batches audit update failed", {
        message: batchErr.message,
        code: batchErr.code,
      });
    }

    if (!data || data.length === 0) {
      // No matching pending row. Either already claimed (idempotent retry),
      // the reservation expired and was overwritten, or the placeholder→real
      // id swap in /api/checkout never landed. Log enough detail to diagnose
      // without leaking secrets, and return 200 so Stripe stops retrying.
      const diagnostics: Record<string, unknown> = {
        stripe_session_id: session.id,
        metadata: session.metadata,
      };

      // Batch path: metadata.batch_id is set by /api/checkout/batch.
      const batchId = session.metadata?.batch_id;
      if (batchId) {
        const { data: batch, error: batchLookupErr } = await supabase
          .from("checkout_batches")
          .select("status,square_count,pending_until,claimed_at,created_at")
          .eq("id", batchId)
          .maybeSingle();
        if (batchLookupErr) {
          diagnostics.batch_lookup_error = batchLookupErr.message;
        } else if (!batch) {
          diagnostics.batch_for_id = "missing";
        } else {
          diagnostics.batch_for_id = batch;
        }
      }

      // Single-square path: metadata.x and metadata.y are set by /api/checkout.
      const xRaw = session.metadata?.x;
      const yRaw = session.metadata?.y;
      const xNum = xRaw != null ? Number.parseInt(xRaw, 10) : NaN;
      const yNum = yRaw != null ? Number.parseInt(yRaw, 10) : NaN;
      if (Number.isInteger(xNum) && Number.isInteger(yNum)) {
        const { data: existing, error: lookupErr } = await supabase
          .from("squares")
          .select(
            "x,y,status,pending_until,claimed_at,created_at,stripe_session_id",
          )
          .eq("x", xNum)
          .eq("y", yNum)
          .maybeSingle();
        if (lookupErr) {
          diagnostics.lookup_error = lookupErr.message;
        } else if (!existing) {
          diagnostics.row_for_xy = "missing";
        } else {
          // Don't echo the stored stripe_session_id verbatim — show only
          // whether it matches and a short prefix to distinguish placeholder
          // vs real Stripe ids (cs_test_/cs_live_ vs placeholder_).
          const stored = existing.stripe_session_id ?? "";
          diagnostics.row_for_xy = {
            status: existing.status,
            pending_until: existing.pending_until,
            claimed_at: existing.claimed_at,
            created_at: existing.created_at,
            session_id_matches: stored === session.id,
            stored_session_id_prefix: stored.slice(0, 12),
          };
        }
      } else if (!batchId) {
        diagnostics.row_for_xy = "metadata missing x/y and batch_id";
      }

      console.warn(
        "[webhook] checkout.session.completed had no matching pending row",
        diagnostics,
      );
      return NextResponse.json({ received: true, claimed: 0 });
    }

    return NextResponse.json({ received: true, claimed: data.length });
  }

  if (event.type === "checkout.session.expired") {
    // Free up the cell(s) early when Stripe declares the session expired.
    // Same query handles single (1 row) and batch (N rows).
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("squares")
      .delete()
      .eq("stripe_session_id", session.id)
      .eq("status", "pending");
    if (error) {
      console.error("webhook expire-cleanup error:", error);
    }

    // Audit: mark batch expired if there was one.
    const { error: batchErr } = await supabase
      .from("checkout_batches")
      .update({ status: "expired" })
      .eq("stripe_session_id", session.id)
      .eq("status", "pending");
    if (batchErr) {
      console.warn("[webhook] checkout_batches expire audit update failed", {
        message: batchErr.message,
        code: batchErr.code,
      });
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, ignored: event.type });
}
