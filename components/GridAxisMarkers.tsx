import { GRID_SIZE } from "@/lib/constants";

const TICK_INTERVAL = 10;

// Labels at columns/rows 10, 20, 30, ... GRID_SIZE. 1-indexed for display.
function buildTicks(): number[] {
  const ticks: number[] = [];
  for (let n = TICK_INTERVAL; n <= GRID_SIZE; n += TICK_INTERVAL) ticks.push(n);
  return ticks;
}

const TICKS = buildTicks();

/**
 * Tick numbers around the grid. Mounted as a sibling of the cell grid; the
 * parent supplies `pl-6 pt-4` of padding so these can sit just outside the
 * cells without clipping. Pointer-events:none so they never intercept clicks.
 */
export function GridAxisMarkers() {
  return (
    <>
      {/* Top axis: column numbers, sit in the top padding strip above the cells. */}
      <div className="pointer-events-none absolute left-6 right-0 top-0 h-4 select-none">
        {TICKS.map((n) => (
          <span
            key={`col-${n}`}
            className="absolute -translate-x-1/2 text-[10px] leading-none tabular-nums text-zinc-400"
            // Centre the label on column n (1-indexed). Cell index is n-1, so
            // pixel centre is (n - 0.5) / GRID_SIZE of the cell-grid width.
            style={{ left: `${((n - 0.5) / GRID_SIZE) * 100}%`, top: "4px" }}
          >
            {n}
          </span>
        ))}
      </div>

      {/* Left axis: row numbers, sit in the left padding strip beside the cells. */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-4 w-6 select-none">
        {TICKS.map((n) => (
          <span
            key={`row-${n}`}
            className="absolute right-1 -translate-y-1/2 text-[10px] leading-none tabular-nums text-zinc-400"
            style={{ top: `${((n - 0.5) / GRID_SIZE) * 100}%` }}
          >
            {n}
          </span>
        ))}
      </div>
    </>
  );
}
