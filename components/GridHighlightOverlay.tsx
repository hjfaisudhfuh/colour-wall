import { GRID_SIZE } from "@/lib/constants";

type Props = {
  /** 0-indexed cell to highlight, or null. */
  highlightedCell: { x: number; y: number } | null;
};

/**
 * Pulsing ring marking the cell the user jumped to. Rendered as a single
 * absolutely-positioned div inside the cell-grid container — does not touch
 * the per-cell render loop.
 *
 * `ring-inset` keeps the ring inside the cell box so it isn't clipped at the
 * grid's rounded corners (the parent has overflow-hidden for the rounded mat).
 */
export function GridHighlightOverlay({ highlightedCell }: Props) {
  if (!highlightedCell) return null;
  const { x, y } = highlightedCell;
  const cellPercent = 100 / GRID_SIZE;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10 animate-pulse rounded-sm ring-2 ring-inset ring-rose-500"
      style={{
        left: `${x * cellPercent}%`,
        top: `${y * cellPercent}%`,
        width: `${cellPercent}%`,
        height: `${cellPercent}%`,
      }}
    />
  );
}
