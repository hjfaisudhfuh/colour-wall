"use client";

import { useEffect, useState } from "react";

type Props = { x: number; y: number };

export function SuccessPoll({ x, y }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (confirmed) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/squares", { cache: "no-store" });
        const data = (await res.json()) as {
          squares: { x: number; y: number }[];
        };
        if (cancelled) return;
        const found = data.squares?.some((s) => s.x === x && s.y === y);
        if (found) {
          setConfirmed(true);
          clearInterval(interval);
        } else {
          setTick((t) => t + 1);
        }
      } catch {
        // network blip — keep polling
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [x, y, confirmed]);

  if (confirmed) {
    return (
      <p className="text-sm text-rose-700">
        Square {x},{y} is on the wall.
      </p>
    );
  }

  return (
    <p className="text-sm text-zinc-500">
      Confirming your square…
      {tick > 5 && (
        <span className="mt-1 block text-xs">
          Still confirming. This usually takes a few seconds — feel free to
          refresh.
        </span>
      )}
    </p>
  );
}
