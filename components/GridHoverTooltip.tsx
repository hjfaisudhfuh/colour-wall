"use client";

import { useEffect, useRef, useState } from "react";
import type { ClaimedSquare } from "@/app/api/squares/route";
import { GRID_SIZE } from "@/lib/constants";
import { formatCoord } from "@/lib/coords";

type Props = {
  /** Map keyed by `${x},${y}` for O(1) lookups while pointer-tracking. */
  claimedMap: Map<string, ClaimedSquare>;
  /** Cell-grid element. Defines hit-test bounds. */
  containerRef: React.RefObject<HTMLDivElement | null>;
};

type TooltipState = {
  cellX: number;
  cellY: number;
  pointerX: number;
  pointerY: number;
  claimed: ClaimedSquare | null;
};

/**
 * One floating element that follows the cursor while hovering the cell grid.
 * Pointer events are listened on the container, not per-cell, so the cell
 * render loop is untouched and adding a tooltip costs ~1 DOM node total.
 *
 * Hidden on touch / coarse-pointer devices via media-query gate — touching is
 * the same as clicking, there's no separate hover state to surface.
 */
export function GridHoverTooltip({ claimedMap, containerRef }: Props) {
  const [state, setState] = useState<TooltipState | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEventRef = useRef<PointerEvent | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    function flush() {
      rafRef.current = null;
      const evt = lastEventRef.current;
      if (!evt || !el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const cellW = rect.width / GRID_SIZE;
      const cellH = rect.height / GRID_SIZE;
      const cx = Math.floor((evt.clientX - rect.left) / cellW);
      const cy = Math.floor((evt.clientY - rect.top) / cellH);
      if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) {
        setState(null);
        return;
      }
      const claimed = claimedMap.get(`${cx},${cy}`) ?? null;
      setState((prev) => {
        // Avoid re-render if we're still over the same cell and the pointer
        // moved a trivial amount — coords haven't changed and we don't want
        // every sub-pixel move to re-render. The pointer x/y do still update
        // for tooltip positioning, but we only commit when the cell shifts.
        if (
          prev &&
          prev.cellX === cx &&
          prev.cellY === cy &&
          Math.abs(prev.pointerX - evt.clientX) < 4 &&
          Math.abs(prev.pointerY - evt.clientY) < 4
        ) {
          return prev;
        }
        return {
          cellX: cx,
          cellY: cy,
          pointerX: evt.clientX,
          pointerY: evt.clientY,
          claimed,
        };
      });
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return; // belt-and-braces with the mq
      lastEventRef.current = e;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    }
    function onLeave() {
      lastEventRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setState(null);
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [claimedMap, containerRef]);

  if (!state) return null;

  const claimed = state.claimed;
  const sub = claimed
    ? claimed.message
      ? `“${claimed.message.length > 30 ? claimed.message.slice(0, 30) + "…" : claimed.message}”`
      : claimed.name
        ? `by ${claimed.name}`
        : "Claimed"
    : "Empty · click to claim";

  // Position above the cursor unless near the top of the viewport.
  const top = state.pointerY < 60 ? state.pointerY + 24 : state.pointerY - 44;

  return (
    <div
      role="presentation"
      className="pointer-events-none fixed z-40 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 shadow-md ring-1 ring-rose-100"
      style={{ left: state.pointerX, top }}
    >
      <div className="text-xs font-medium tabular-nums text-zinc-700">
        {formatCoord(state.cellX, state.cellY)}
      </div>
      <div className="mt-0.5 max-w-[200px] truncate text-[11px] text-zinc-500">
        {sub}
      </div>
    </div>
  );
}
