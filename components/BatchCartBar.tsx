"use client";

import { PRICE_CENTS } from "@/lib/constants";

type Props = {
  selectedCount: number;
  onClaim: () => void;
};

/**
 * Sticky bottom bar shown only when at least one cell is selected in select
 * mode. Tapping "Claim selected" opens the BatchClaimDialog.
 */
export function BatchCartBar({ selectedCount, onClaim }: Props) {
  if (selectedCount === 0) return null;
  const dollars = ((PRICE_CENTS * selectedCount) / 100).toFixed(2);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      // Respect iOS home-indicator / Safari URL bar. env(safe-area-inset-bottom)
      // is 0 on non-iOS so the max() falls back to 1rem there.
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-full bg-zinc-900 px-5 py-3 text-white shadow-2xl ring-1 ring-black/10">
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Selected
          </span>
          <span className="text-base font-semibold tabular-nums">
            {selectedCount} · ${dollars}
          </span>
        </div>
        <button
          type="button"
          onClick={onClaim}
          className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
        >
          Claim selected
        </button>
      </div>
    </div>
  );
}
