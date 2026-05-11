"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { GRID_SIZE, MAX_BATCH_SIZE, PRICE_CENTS } from "@/lib/constants";
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
import { WallProgress } from "./WallProgress";
import { BatchCartBar } from "./BatchCartBar";
import { BatchClaimDialog } from "./BatchClaimDialog";

type Props = { initialClaimed: ClaimedSquare[] };

const HIGHLIGHT_DURATION_MS = 4000;
// After a drag ends we set suppressNextClickRef = true. The browser may or
// may not fire the synthetic click event afterward (depends on movement
// thresholds). Reset the flag after this window so it never leaks into a
// future click that should be honoured.
const SUPPRESS_CLICK_TIMEOUT_MS = 100;
// Pixel-distance threshold before pointer movement counts as a drag. Below
// threshold we let the native click event handle the tap, which preserves
// toggle-to-deselect. ~8px matches typical browser click-vs-drag slop and
// prevents finger jitter on small mobile cells (≈3-4px wide at phone width)
// from accidentally selecting extra cells on every tap.
const DRAG_THRESHOLD_PX = 8;
const DRAG_THRESHOLD_SQ = DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX;

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

  // Drag-to-select state. dragRef tracks the active drag (start cell, last
  // cell crossed, whether we've actually moved). suppressNextClickRef tells
  // the click handler to swallow the click that fires after a drag, so a
  // drag never accidentally toggles a cell off.
  const dragRef = useRef<{
    active: boolean;
    startCell: { x: number; y: number } | null;
    lastCell: { x: number; y: number } | null;
    startX: number;
    startY: number;
    didDrag: boolean;
    pointerId: number | null;
  }>({
    active: false,
    startCell: null,
    lastCell: null,
    startX: 0,
    startY: 0,
    didDrag: false,
    pointerId: null,
  });
  const suppressNextClickRef = useRef(false);
  const suppressResetTimeoutRef = useRef<number | null>(null);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const claimed = claimedMap.get(key(x, y));
      if (claimed) {
        // Claimed-cell popover always wins, drag never starts on claimed
        // cells so this branch is never reached after a drag-paint stroke.
        setOpenPopover(claimed);
        return;
      }

      // If the click follows a drag, swallow it.
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        if (suppressResetTimeoutRef.current !== null) {
          window.clearTimeout(suppressResetTimeoutRef.current);
          suppressResetTimeoutRef.current = null;
        }
        return;
      }

      if (selectMode) {
        setSelected((prev) => {
          const k = key(x, y);
          const next = new Set(prev);
          if (next.has(k)) {
            next.delete(k);
          } else if (next.size < MAX_BATCH_SIZE) {
            next.add(k);
          }
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

  // Clear pending timeouts on unmount.
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      if (suppressResetTimeoutRef.current !== null) {
        window.clearTimeout(suppressResetTimeoutRef.current);
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

  // Bounded paintbrush add: skips claimed, dedupes, enforces MAX_BATCH_SIZE.
  const addCellIfPossible = useCallback(
    (x: number, y: number) => {
      setSelected((prev) => {
        if (prev.size >= MAX_BATCH_SIZE) return prev;
        const k = key(x, y);
        if (claimedMap.has(k)) return prev;
        if (prev.has(k)) return prev;
        const next = new Set(prev);
        next.add(k);
        return next;
      });
    },
    [claimedMap],
  );

  // Drag handlers. Only attached when selectMode is true — outside select
  // mode this is a no-cost feature.
  useEffect(() => {
    if (!selectMode) return;
    const el = cellGridRef.current;
    if (!el) return;

    function cellFromPointer(e: PointerEvent): { x: number; y: number } | null {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const cellW = rect.width / GRID_SIZE;
      const cellH = rect.height / GRID_SIZE;
      const x = Math.floor((e.clientX - rect.left) / cellW);
      const y = Math.floor((e.clientY - rect.top) / cellH);
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
      return { x, y };
    }

    function onPointerDown(e: PointerEvent) {
      // Multi-touch hardening: a second finger / pointer must not hijack
      // the active drag. Ignore additional pointerdowns while a drag is
      // in progress.
      if (dragRef.current.active) return;
      // Only primary mouse button, or any touch/pen contact.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const cell = cellFromPointer(e);
      if (!cell) return;
      // Don't start drag from a claimed cell — let the click flow open
      // the popover.
      if (claimedMap.has(key(cell.x, cell.y))) return;

      dragRef.current.active = true;
      dragRef.current.startCell = cell;
      dragRef.current.lastCell = cell;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.didDrag = false;
      dragRef.current.pointerId = e.pointerId;
      // Don't modify selection yet — we wait for movement to confirm drag.
      // A pure tap (no movement) falls through to the click handler which
      // runs the existing toggle logic.

      try {
        el?.setPointerCapture(e.pointerId);
      } catch {
        // Some browsers may reject capture; safe to ignore.
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragRef.current.active) return;
      if (e.pointerId !== dragRef.current.pointerId) return;

      // Pixel-distance threshold gate. Below threshold = not yet a drag;
      // let pointermove jitter pass without triggering anything. The native
      // click event handles the tap when the pointer lifts.
      if (!dragRef.current.didDrag) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD_SQ) return;
        // Threshold passed — activate drag and add the start cell.
        dragRef.current.didDrag = true;
        const start = dragRef.current.startCell;
        if (start) addCellIfPossible(start.x, start.y);
      }

      const cell = cellFromPointer(e);
      if (!cell) return;
      const last = dragRef.current.lastCell;
      if (last && last.x === cell.x && last.y === cell.y) return;
      addCellIfPossible(cell.x, cell.y);
      dragRef.current.lastCell = cell;
    }

    function onPointerEnd(e: PointerEvent) {
      if (!dragRef.current.active) return;
      if (e.pointerId !== dragRef.current.pointerId) return;
      const wasDrag = dragRef.current.didDrag;
      dragRef.current.active = false;
      dragRef.current.startCell = null;
      dragRef.current.lastCell = null;
      dragRef.current.didDrag = false;
      try {
        el?.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      dragRef.current.pointerId = null;

      if (wasDrag) {
        // Swallow the synthetic click that may follow.
        suppressNextClickRef.current = true;
        if (suppressResetTimeoutRef.current !== null) {
          window.clearTimeout(suppressResetTimeoutRef.current);
        }
        suppressResetTimeoutRef.current = window.setTimeout(() => {
          suppressNextClickRef.current = false;
          suppressResetTimeoutRef.current = null;
        }, SUPPRESS_CLICK_TIMEOUT_MS);
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [selectMode, claimedMap, addCellIfPossible]);

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

  const atCap = selected.size >= MAX_BATCH_SIZE;

  return (
    <>
      <JumpToSquare onJump={handleJump} />

      <WallToolbar
        selectMode={selectMode}
        selectedCount={selected.size}
        onToggle={handleToggleSelectMode}
        onClear={handleClearSelection}
      />

      {selectMode && (
        <p className="mx-auto mb-3 max-w-md text-center text-xs text-zinc-500">
          Click or drag over empty squares to select them.
        </p>
      )}

      {atCap && (
        <p
          className="mx-auto mb-3 max-w-md text-center text-xs text-rose-600"
          role="status"
          aria-live="polite"
        >
          Max {MAX_BATCH_SIZE} squares per checkout.
        </p>
      )}

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
            // touch-action:none in select mode disables browser scroll/zoom
            // gestures so a finger drag becomes paintbrush, not page scroll.
            // user-select:none is always-on; cell buttons have no text but
            // the wrapper might still pick up text-selection on long press.
            className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl ring-1 ring-rose-100/80 ${
              selectMode ? "touch-none" : ""
            }`}
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

      <WallProgress claimedCount={initialClaimed.length} />

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

      {batchOpen &&
        (() => {
          const coords: { x: number; y: number }[] = [];
          for (const k of selected) {
            const [xs, ys] = k.split(",");
            const x = Number.parseInt(xs, 10);
            const y = Number.parseInt(ys, 10);
            if (Number.isFinite(x) && Number.isFinite(y))
              coords.push({ x, y });
          }
          if (coords.length === 0) return null;
          return (
            <BatchClaimDialog
              coords={coords}
              onClose={() => setBatchOpen(false)}
            />
          );
        })()}
    </>
  );
}
