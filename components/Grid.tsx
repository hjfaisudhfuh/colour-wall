"use client";

import { useCallback, useMemo, useState } from "react";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { GRID_SIZE, PRICE_CENTS } from "@/lib/constants";
import { ClaimDialog } from "./ClaimDialog";
import { SquarePopover } from "./SquarePopover";

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

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const claimed = claimedMap.get(key(x, y));
      if (claimed) {
        if (claimed.name || claimed.link) setOpenPopover(claimed);
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
                ? `claimed square at ${x}, ${y}`
                : `empty square at ${x}, ${y}`
            }
            onClick={() => handleCellClick(x, y)}
            style={style}
            className={
              claimed
                ? "h-full w-full cursor-pointer transition hover:opacity-80"
                : "h-full w-full cursor-pointer bg-white hover:bg-zinc-200"
            }
          />,
        );
      }
    }
    return out;
  }, [claimedMap, handleCellClick]);

  return (
    <>
      <div
        className="aspect-square w-full overflow-hidden rounded-md border border-zinc-200 shadow-sm"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          contain: "layout paint",
        }}
      >
        {cells}
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
