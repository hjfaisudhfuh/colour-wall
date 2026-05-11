import { GRID_SIZE } from "@/lib/constants";

const TOTAL = GRID_SIZE * GRID_SIZE;

/**
 * Format a 0..100 percentage for display.
 * - 0 → "0%"
 * - <1 → 2 decimals (e.g., "0.12%") — meaningful at very low counts
 * - <100 → 1 decimal (e.g., "4.7%")
 * - 100 → "100%"
 */
function formatPercent(pct: number): string {
  if (pct <= 0) return "0%";
  if (pct >= 100) return "100%";
  if (pct < 1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(1)}%`;
}

type Props = {
  claimedCount: number;
};

/**
 * Honest progress signal toward The Million Wall unlock. Sits below the
 * wall mat. The bar fill is truly proportional — at very low percentages
 * it's nearly invisible by design (no scaling tricks). The number text
 * carries the meaning until the bar is wide enough to see.
 */
export function WallProgress({ claimedCount }: Props) {
  const pct = (claimedCount / TOTAL) * 100;

  return (
    <div className="mx-auto mt-4 max-w-2xl px-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        <span>
          <span className="font-semibold tabular-nums text-zinc-700">
            {claimedCount.toLocaleString()}
          </span>{" "}
          / {TOTAL.toLocaleString()} claimed
        </span>
        <span aria-hidden className="text-zinc-300">
          ·
        </span>
        <span>
          <span className="font-semibold tabular-nums text-zinc-700">
            {formatPercent(pct)}
          </span>{" "}
          to The Million Wall
        </span>
      </div>

      <div
        className="mx-auto mt-2 h-1 max-w-md overflow-hidden rounded-full bg-rose-100"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="The Million Wall unlock progress"
      >
        <div
          className="h-full bg-rose-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-xs italic text-zinc-500">
        Every claim brings The Million Wall closer.
      </p>
    </div>
  );
}
