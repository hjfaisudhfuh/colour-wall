import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ClaimedSquare = {
  x: number;
  y: number;
  color: string;
  name: string | null;
  link: string | null;
  feeling_category: string | null;
  message: string | null;
  claimed_at: string | null;
};

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("squares")
    .select("x,y,color,name,link,feeling_category,message,claimed_at")
    .eq("status", "claimed");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { squares: (data ?? []) as ClaimedSquare[] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
      },
    },
  );
}
