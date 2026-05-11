"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { GRID_SIZE, PRICE_CENTS } from "@/lib/constants";
import { ClaimDialog } from "./ClaimDialog";
import { SquarePopover } from "./SquarePopover";
import { GridAxisMarkers } from "./GridAxisMarkers";
import { GridHoverTooltip } from "./GridHoverTooltip";
import { GridHighlightOverlay } from "./GridHighlightOverlay";
import { GridSelectionOverlay } from "./GridSelectionOverlay";
import { JumpToSquare } from "./JumpToSquare";
import { MonoTag } from "./MonoTag";
import { WallStats } from "./WallStats";
import { WallToolbar } from "./WallToolbar";
import { BatchCartBar } from "./BatchCartBar";
import { BatchClaimDialog } from "./BatchClaimDialog";

type Props = { initialClaimed: ClaimedSquare[] };

const HIGHLIGHT_DURATION_MS = 4000;

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
  const [highlightedCell, setHighlightedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Multi-select state for batch checkout.
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [batchOpen, setBatchOpen] = useState(false);

  const cellGridRef = useRef<HTMLDivElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const k = key(x, y);
      const claimed = claimedMap.get(k);

      // Claimed cells always open the popover, even in select mode —
      // selection is for empty cells only.
      if (claimed) {
        setOpenPopover(claimed);
        return;
      }

      if (selectMode) {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(k)) next.delete(k);
          else next.add(k);
          return next;
        });
        return;
      }

      setOpenClaim({ x, y });
    },
    [claimedMap, selectMode],
  );

  const handleJump = useCallback((x: number, y: number) => {
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedCell({ x, y });
    cellGridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedCell(null);
      highlightTimeoutRef.current = null;
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  // Clear pending highlight timeout on unmount.
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleSelectMode = useCallback(() => {
    setSelectMode((m) => {
      // Leaving select mode clears the selection.
      if (m) setSelected(new Set());
      return !m;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectedCoords = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (const k of selected) {
      const [xs, ys] = k.split(",");
      const x = Number.parseInt(xs, 10);
      const y = Number.parseInt(ys, 10);
      if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y });
    }
    return out;
  }, [selected]);

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
      <JumpToSquare onJump={handleJump} />

      <WallToolbar
        selectMode={selectMode}
        selectedCount={selected.size}
        onToggle={handleToggleSelectMode}
        onClear={handleClearSelection}
      />

      <div className="rounded-3xl bg-white/70 p-3 shadow-[0_30px_80px_-30px_rgba(180,100,140,0.35)] ring-1 ring-rose-200/80 backdrop-blur-sm sm:p-5">
        <div className="mb-3 flex flex-col items-center gap-2 sm:mb-4">
          <MonoTag>The First Wall</MonoTag>
          <WallStats claimedCount={initialClaimed.length} />
        </div>
        <div className="mb-3 h-px bg-rose-200/60 sm:mb-4" />

        <div className="relative pl-6 pt-4">
          <GridAxisMarkers />

          <div
            ref={cellGridRef}
            className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-rose-100/80"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              contain: "layout paint",
            }}
          >
            {cells}
            <GridSelectionOverlay selected={selected} />
            <GridHighlightOverlay highlightedCell={highlightedCell} />
          </div>

          <GridHoverTooltip
            claimedMap={claimedMap}
            containerRef={cellGridRef}
          />
        </div>
      </div>

      {/* Sticky cart bar — only shown when at least one cell is selected. */}
      <BatchCartBar
        selectedCount={selected.size}
        onClaim={() => setBatchOpen(true)}
      />

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

      {batchOpen && selectedCoords.length > 0 && (
        <BatchClaimDialog
          coords={selectedCoords}
          onClose={() => setBatchOpen(false)}
          onClaimError={() => {
            // 409 from the server (one or more squares no longer available).
            // We can't know which, so the safest UX is to keep the dialog
            // open with the error visible and let the user clear/re-pick.
          }}
        />
      )}
    </>
  );
}
