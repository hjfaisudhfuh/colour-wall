import Link from "next/link";
import { SuccessPoll } from "./SuccessPoll";

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

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Thanks — payment received</h1>
      <p className="text-zinc-600">
        Your square is being confirmed. This usually takes a few seconds while
        Stripe notifies our servers.
      </p>

      {x !== null && y !== null && <SuccessPoll x={x} y={y} />}

      <Link
        href="/"
        className="mt-4 inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Back to the grid
      </Link>
    </main>
  );
}
