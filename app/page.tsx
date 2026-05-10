import { getServiceClient } from "@/lib/supabase/server";
import { Grid } from "@/components/Grid";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { PRICE_CENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function loadClaimedSquares(): Promise<ClaimedSquare[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("squares")
      .select("x,y,color,name,link")
      .eq("status", "claimed");
    if (error) {
      console.error("loadClaimedSquares error:", error);
      return [];
    }
    return (data ?? []) as ClaimedSquare[];
  } catch (e) {
    // Render gracefully even if Supabase isn't configured yet.
    console.error("loadClaimedSquares threw:", e);
    return [];
  }
}

export default async function HomePage() {
  const claimed = await loadClaimedSquares();
  const dollars = (PRICE_CENTS / 100).toFixed(2);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dollar Grid</h1>
        <p className="text-zinc-600">
          10,000 squares. ${dollars} each. Click an empty square to claim it.
          Add an optional name and https:// link. Once paid, it&apos;s yours
          forever.
        </p>
        <p className="text-xs text-zinc-500">
          {claimed.length.toLocaleString()} of 10,000 claimed.
        </p>
      </header>

      <Grid initialClaimed={claimed} />

      <footer className="mt-8 text-xs text-zinc-500">
        Powered by Stripe + Supabase. No accounts, no sign-ups.
      </footer>
    </main>
  );
}
