"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { GRID_SIZE, PRICE_CENTS } from "@/lib/constants";
import { ClaimDialog } from "./ClaimDialog";
import { SquarePopover } from "./SquarePopover";
import { GridAxisMarkers } from "./GridAxisMarkers";
import { GridHoverTooltip } from "./GridHoverTooltip";

type Props = { initialClaimed: ClaimedSquare[] };

function key(x: number, y: number): string {
  return `${x},${y}`;
}

export function Grid({ initialClaimed }: Props) {
  const claimedMap = useMemo(() => {
    const m = new Map<string, ClaimedSquare>();
    for (const s of initialClaimed) m.set(key(s.x, s.y), s);
    return m;
  }, [initialClaimed]);

  const [openClaim, setOpenClaim] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [openPopover, setOpenPopover] = useState<ClaimedSquare | null>(null);

  // The hover tooltip listens on this ref. Cells are descendants, so pointer
  // events bubble — we don't have to attach handlers per cell.
  const cellGridRef = useRef<HTMLDivElement | null>(null);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const claimed = claimedMap.get(key(x, y));
      if (claimed) {
        setOpenPopover(claimed);
        return;
      }
      setOpenClaim({ x, y });
    },
    [claimedMap],
  );

  const cells = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const claimed = claimedMap.get(key(x, y));
        const style: React.CSSProperties = claimed
          ? { backgroundColor: claimed.color }
          : {};
        out.push(
          <button
            key={key(x, y)}
            type="button"
            aria-label={
              claimed
                ? `claimed square at column ${x + 1}, row ${y + 1}`
                : `empty square at column ${x + 1}, row ${y + 1}`
            }
            onClick={() => handleCellClick(x, y)}
            style={style}
            className={
              claimed
                ? "h-full w-full cursor-pointer transition-[filter] duration-150 hover:brightness-110"
                : "h-full w-full cursor-pointer bg-white/60 transition-colors duration-150 hover:bg-rose-100"
            }
          />,
        );
      }
    }
    return out;
  }, [claimedMap, handleCellClick]);

  return (
    <>
      {/* Padding leaves room for axis labels (top + left). */}
      <div className="relative pl-6 pt-4">
        <GridAxisMarkers />

        <div
          ref={cellGridRef}
          className="aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-rose-100/80"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            contain: "layout paint",
          }}
        >
          {cells}
        </div>

        <GridHoverTooltip
          claimedMap={claimedMap}
          containerRef={cellGridRef}
        />
      </div>

      {openClaim && (
        <ClaimDialog
          x={openClaim.x}
          y={openClaim.y}
          priceCents={PRICE_CENTS}
          onClose={() => setOpenClaim(null)}
        />
      )}

      {openPopover && (
        <SquarePopover
          square={openPopover}
          onClose={() => setOpenPopover(null)}
        />
      )}
    </>
  );
}
