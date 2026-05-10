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
      <p className="font-medium text-green-700">
        Square ({x}, {y}) is now claimed.
      </p>
    );
  }

  return (
    <p className="text-sm text-zinc-500">
      Waiting for confirmation…{" "}
      {tick > 5 && (
        <span className="block">
          Still waiting. The webhook will arrive shortly; you can also refresh.
        </span>
      )}
    </p>
  );
}
