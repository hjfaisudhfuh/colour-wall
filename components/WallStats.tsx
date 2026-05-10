import { GRID_SIZE } from "@/lib/constants";

type Props = {
  claimedCount: number;
};

const TOTAL = GRID_SIZE * GRID_SIZE;

/**
 * Status-bar style stat row. Lives inside the wall mat above the grid.
 *
 *   CLAIMED 4    LEFT 9,996    $1 EACH
 *
 * The third pair hides on small screens to keep the row on a single line at
 * 320px width.
 */
export function WallStats({ claimedCount }: Props) {
  const left = TOTAL - claimedCount;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
      <span>
        Claimed{" "}
        <span className="font-semibold tabular-nums text-zinc-700">
          {claimedCount.toLocaleString()}
        </span>
      </span>
      <span aria-hidden className="text-zinc-300">
        ·
      </span>
      <span>
        Left{" "}
        <span className="font-semibold tabular-nums text-zinc-700">
          {left.toLocaleString()}
        </span>
      </span>
      <span aria-hidden className="hidden text-zinc-300 sm:inline">
        ·
      </span>
      <span className="hidden sm:inline">
        $1 <span className="font-semibold text-zinc-700">EACH</span>
      </span>
    </div>
  );
}
