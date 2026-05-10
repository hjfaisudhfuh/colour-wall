import { getServiceClient } from "@/lib/supabase/server";
import { Grid } from "@/components/Grid";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LatestMarks } from "@/components/LatestMarks";
import { MakeSomethingBigger } from "@/components/MakeSomethingBigger";
import { WhyOneDollar } from "@/components/WhyOneDollar";
import { TikTokHook } from "@/components/TikTokHook";
import { Footer } from "@/components/Footer";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { GRID_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const TOTAL_SQUARES = GRID_SIZE * GRID_SIZE;

async function loadClaimedSquares(): Promise<ClaimedSquare[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("squares")
      .select("x,y,color,name,link,feeling_category,message,claimed_at")
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

  // Most-recent-first slice for the social-proof rail.
  const recent = [...claimed]
    .filter((c) => c.claimed_at != null)
    .sort((a, b) => (b.claimed_at! < a.claimed_at! ? -1 : 1))
    .slice(0, 12);

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4">
      <Hero claimedCount={claimed.length} totalCount={TOTAL_SQUARES} />

      <section id="wall" className="scroll-mt-8 px-0 py-4 sm:py-8">
        <div className="mb-4 text-center">
          <h2 className="font-serif text-2xl text-zinc-900 sm:text-3xl">
            The wall so far
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Tap an empty square to claim it. Want to make something bigger?
            Claim neighbouring squares one by one.
          </p>
        </div>

        <div className="rounded-3xl bg-white/70 p-2 shadow-[0_30px_80px_-30px_rgba(180,100,140,0.35)] ring-1 ring-rose-100 backdrop-blur-sm sm:p-4">
          <Grid initialClaimed={claimed} />
        </div>
      </section>

      <TikTokHook />
      <HowItWorks />
      <MakeSomethingBigger />
      <LatestMarks squares={recent} />
      <WhyOneDollar />
      <Footer />
    </main>
  );
}
