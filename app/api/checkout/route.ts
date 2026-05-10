import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { checkoutBodySchema } from "@/lib/validation";
import { PRICE_CENTS, RESERVATION_MINUTES } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function originFromRequest(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { x, y, color, name, link, feeling_category, message } = parsed.data;
  const cleanName = name && name.length > 0 ? name : null;
  const cleanLink = link && link.length > 0 ? link : null;
  const cleanMessage = message && message.length > 0 ? message : null;
  const cleanFeeling = feeling_category ?? null;

  const supabase = getServiceClient();
  const placeholderId = `placeholder_${randomUUID()}`;

  // 1. Reserve atomically. Returns the row, or null if blocked.
  const { data: reserved, error: reserveErr } = await supabase.rpc(
    "reserve_square",
    {
      p_x: x,
      p_y: y,
      p_color: color,
      p_name: cleanName,
      p_link: cleanLink,
      p_feeling_category: cleanFeeling,
      p_message: cleanMessage,
      p_session_id: placeholderId,
      p_price_cents: PRICE_CENTS,
      p_minutes: RESERVATION_MINUTES,
    },
  );

  if (reserveErr) {
    console.error("[checkout] reserve_square rpc error:", reserveErr);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
  if (!reserved) {
    return NextResponse.json(
      { error: "square is already taken or pending" },
      { status: 409 },
    );
  }

  // 2. Create Stripe Checkout session.
  const origin = originFromRequest(req);
  const stripe = getStripe();
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
              name: `The Colour Wall — square (${x}, ${y})`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?x=${x}&y=${y}`,
      cancel_url: `${origin}/cancel`,
      // Match DB pending_until so a payment cannot land after our hold ends.
      // Stripe minimum is 30 minutes from now, so RESERVATION_MINUTES must be >= 30.
      expires_at:
        Math.floor(Date.now() / 1000) + RESERVATION_MINUTES * 60,
      metadata: {
        x: String(x),
        y: String(y),
        square_id: `${x},${y}`,
      },
    });
  } catch (e) {
    console.error("[checkout] stripe session create failed:", e);
    // Free the cell so the user can retry immediately.
    await supabase
      .from("squares")
      .delete()
      .eq("x", x)
      .eq("y", y)
      .eq("stripe_session_id", placeholderId);
    return NextResponse.json(
      { error: "payment provider unavailable" },
      { status: 502 },
    );
  }

  // 3. Replace placeholder with the real Stripe session id.
  // .select() is required: without it Supabase reports success even when zero
  // rows match, which would let us redirect to Checkout while the DB still
  // holds the placeholder — the webhook would then never find the row.
  const { data: updated, error: updateErr } = await supabase
    .from("squares")
    .update({ stripe_session_id: session.id })
    .eq("x", x)
    .eq("y", y)
    .eq("stripe_session_id", placeholderId)
    .select("x,y,stripe_session_id,status");

  const updatedCount = updated?.length ?? 0;

  if (updateErr || updatedCount === 0) {
    if (updateErr) {
      console.error("[checkout] update session_id failed:", updateErr);
    } else {
      console.error("[checkout] update session_id matched 0 rows", {
        x,
        y,
        placeholder_session_id: placeholderId,
        stripe_session_id: session.id,
      });
    }
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (expireErr) {
      console.error(
        "[checkout] failed to expire orphan stripe session:",
        expireErr,
      );
    }
    // Best-effort cleanup of the placeholder row so the cell is freed.
    await supabase
      .from("squares")
      .delete()
      .eq("x", x)
      .eq("y", y)
      .eq("stripe_session_id", placeholderId);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }

  if (!session.url) {
    // Row already points at session.id; expire so payment can't land.
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (expireErr) {
      console.error(
        "[checkout] failed to expire stripe session missing url:",
        expireErr,
      );
    }
    await supabase
      .from("squares")
      .delete()
      .eq("x", x)
      .eq("y", y)
      .eq("stripe_session_id", session.id);
    return NextResponse.json(
      { error: "stripe session missing url" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
