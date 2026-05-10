import { SuccessPoll } from "./SuccessPoll";
import { SuccessActions } from "./SuccessActions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ x?: string; y?: string }>;

function parseCoord(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0 || n > 99) return null;
  return n;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const x = parseCoord(params.x);
  const y = parseCoord(params.y);
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-20 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-rose-300 via-orange-200 to-violet-300 shadow-lg ring-4 ring-white" />

      <h1 className="font-serif text-4xl leading-tight text-zinc-900 sm:text-5xl">
        Your square is on the wall.
      </h1>
      <p className="mt-4 text-base text-zinc-700">
        You claimed a tiny piece of the internet.
      </p>

      {x !== null && y !== null && (
        <div className="mt-6">
          <SuccessPoll x={x} y={y} />
        </div>
      )}

      <p className="mt-6 text-sm text-zinc-700">
        Screenshot your square and post it on TikTok.
      </p>

      <SuccessActions baseUrl={baseUrl} />

      <p className="mt-6 text-xs text-zinc-500">
        Tell a friend to claim a square next to yours.
      </p>
    </main>
  );
}
