import { getServiceClient } from "@/lib/supabase/server";
import { Grid } from "@/components/Grid";
import { Hero } from "@/components/Hero";
import { LatestMarks } from "@/components/LatestMarks";
import { MakeYourMark } from "@/components/MakeYourMark";
import { WallLaunchBanner } from "@/components/WallLaunchBanner";
import { WhyOneDollar } from "@/components/WhyOneDollar";
import { TikTokHook } from "@/components/TikTokHook";
import { Footer } from "@/components/Footer";
import type { ClaimedSquare } from "@/app/api/squares/route";

export const dynamic = "force-dynamic";

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
      <Hero />

      <section id="wall" className="scroll-mt-8 px-0 py-4 sm:py-8">
        <WallLaunchBanner />
        <Grid initialClaimed={claimed} />
      </section>

      <TikTokHook />
      <MakeYourMark />
      <LatestMarks squares={recent} />
      <WhyOneDollar />
      <Footer />
    </main>
  );
}
