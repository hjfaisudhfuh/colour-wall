import { SuccessPoll } from "./SuccessPoll";
import { SuccessActions } from "./SuccessActions";
import { SuccessSquareCard } from "./SuccessSquareCard";
import { TrackClaimCompleted } from "./TrackClaimCompleted";
import { getServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ x?: string; y?: string; batch?: string }>;

type SquareMeta = {
  color: string;
  message: string | null;
  name: string | null;
};

function parseCoord(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0 || n > 99) return null;
  return n;
}

// Loose UUID v4 check — defensive only. Real validation happens at the DB
// query (no row matches a malformed id), this just shapes the URL.
function isUuid(v: string | undefined): v is string {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

async function loadSquareMeta(
  x: number,
  y: number,
): Promise<SquareMeta | null> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("squares")
      .select("color,message,name")
      .eq("x", x)
      .eq("y", y)
      .maybeSingle();
    if (error) {
      console.error("[success] square meta lookup error", error);
      return null;
    }
    return (data as SquareMeta | null) ?? null;
  } catch (e) {
    console.error("[success] square meta lookup threw", e);
    return null;
  }
}

async function loadBatchInfo(
  batchId: string,
): Promise<{ squareCount: number | null; meta: SquareMeta | null }> {
  try {
    const supabase = getServiceClient();
    const [batchRes, squareRes] = await Promise.all([
      supabase
        .from("checkout_batches")
        .select("square_count")
        .eq("id", batchId)
        .maybeSingle(),
      // All squares in a batch share the same colour/message/name, so
      // grabbing the first row is enough for the visual card.
      supabase
        .from("squares")
        .select("color,message,name")
        .eq("batch_id", batchId)
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      squareCount: batchRes.data?.square_count ?? null,
      meta: (squareRes.data as SquareMeta | null) ?? null,
    };
  } catch (e) {
    console.error("[success] batch info lookup threw", e);
    return { squareCount: null, meta: null };
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const x = parseCoord(params.x);
  const y = parseCoord(params.y);
  const batchId = isUuid(params.batch) ? params.batch : null;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

  // ---- BATCH path ----
  if (batchId) {
    const { squareCount, meta } = await loadBatchInfo(batchId);
    const headline =
      squareCount != null && squareCount > 0
        ? `Your ${squareCount} squares are on the wall.`
        : "Your squares are on the wall.";
    const body =
      squareCount != null && squareCount > 0
        ? `You claimed ${squareCount} tiny pieces of the internet.`
        : "You claimed a piece of the internet.";

    return (
      <main className="mx-auto flex max-w-md flex-col px-4 py-20 text-center">
        <TrackClaimCompleted type="batch" count={squareCount ?? 0} />
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-rose-300 via-orange-200 to-violet-300 shadow-lg ring-4 ring-white" />

        <h1 className="font-serif text-4xl leading-tight text-zinc-900 sm:text-5xl">
          {headline}
        </h1>
        <p className="mt-4 text-base text-zinc-700">{body}</p>

        {meta && (
          <SuccessSquareCard
            x={null}
            y={null}
            count={squareCount ?? 0}
            color={meta.color}
            message={meta.message}
            name={meta.name}
          />
        )}

        <p className="mt-6 text-sm text-zinc-500">
          They&apos;ll appear on the wall within a few seconds. Refresh to see
          them.
        </p>

        <p className="mt-6 text-sm text-zinc-700">
          Screenshot your squares and post them on TikTok.
        </p>

        <SuccessActions baseUrl={baseUrl} x={null} y={null} />

        <p className="mt-6 text-xs text-zinc-500">
          Want to start a chain? Tell a friend to claim a square next to yours.
        </p>

        <p className="mt-4 text-xs italic text-zinc-500">
          You&apos;re part of The First Wall. When it fills, The Million Wall
          opens.
        </p>
      </main>
    );
  }

  // ---- SINGLE-SQUARE path ----
  const meta =
    x !== null && y !== null ? await loadSquareMeta(x, y) : null;

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-20 text-center">
      {x !== null && y !== null && (
        <TrackClaimCompleted type="single" count={1} />
      )}
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-rose-300 via-orange-200 to-violet-300 shadow-lg ring-4 ring-white" />

      <h1 className="font-serif text-4xl leading-tight text-zinc-900 sm:text-5xl">
        Your square is on the wall.
      </h1>
      <p className="mt-4 text-base text-zinc-700">
        You claimed a tiny piece of the internet.
      </p>

      {meta && x !== null && y !== null && (
        <SuccessSquareCard
          x={x}
          y={y}
          count={1}
          color={meta.color}
          message={meta.message}
          name={meta.name}
        />
      )}

      {x !== null && y !== null && (
        <div className="mt-6">
          <SuccessPoll x={x} y={y} />
        </div>
      )}

      <p className="mt-6 text-sm text-zinc-700">
        Screenshot your square and post it on TikTok.
      </p>

      <SuccessActions baseUrl={baseUrl} x={x} y={y} />

      <p className="mt-6 text-xs text-zinc-500">
        Want to start a chain? Tell a friend to claim a square next to yours.
      </p>

      <p className="mt-4 text-xs italic text-zinc-500">
        You&apos;re part of The First Wall. When it fills, The Million Wall
        opens.
      </p>
    </main>
  );
}
