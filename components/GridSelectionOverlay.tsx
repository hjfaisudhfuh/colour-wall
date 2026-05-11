import { GRID_SIZE } from "@/lib/constants";

type Props = {
  /** Set of "x,y" keys (0-indexed) currently selected. */
  selected: Set<string>;
};

// Universal-contrast selection outline: 1px dark slate on the outside, 1px
// white inset behind it. Visible on any cell colour (rose claimed cells,
// white empty cells, dark cells). Replaces ring-2 ring-rose-500 which
// disappeared on warm-toned claimed neighbours.
const SELECTION_OUTLINE =
  "inset 0 0 0 1px #0f172a, inset 0 0 0 2px #ffffff";

/**
 * Renders a high-contrast selection outline on every selected cell. Same
 * pattern as GridHighlightOverlay (one absolutely-positioned div per item,
 * sibling of the cells, pointer-events-none so clicks pass through to the
 * underlying cell button). Cell render loop is untouched.
 *
 * For modest selection counts (≤50, the API max) this is fine. The overlay
 * count grows with selection; at 50 we'd have 50 absolutely-positioned divs
 * — negligible cost.
 */
export function GridSelectionOverlay({ selected }: Props) {
  if (selected.size === 0) return null;
  const cellPercent = 100 / GRID_SIZE;

  const items: React.ReactNode[] = [];
  for (const k of selected) {
    const [xs, ys] = k.split(",");
    const x = Number.parseInt(xs, 10);
    const y = Number.parseInt(ys, 10);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    items.push(
      <div
        key={k}
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: `${x * cellPercent}%`,
          top: `${y * cellPercent}%`,
          width: `${cellPercent}%`,
          height: `${cellPercent}%`,
          boxShadow: SELECTION_OUTLINE,
        }}
      />,
    );
  }
  return <>{items}</>;
}
