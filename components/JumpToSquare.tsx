"use client";

import { useState } from "react";
import { GRID_SIZE } from "@/lib/constants";
import { MonoTag } from "./MonoTag";

type Props = {
  /** Called with 0-indexed coords after the user's 1-indexed input is validated. */
  onJump: (x: number, y: number) => void;
};

const RANGE_HINT = `1–${GRID_SIZE}`;

export function JumpToSquare({ onJump }: Props) {
  const [col, setCol] = useState("");
  const [row, setRow] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const c = Number.parseInt(col, 10);
    const r = Number.parseInt(row, 10);
    if (!Number.isInteger(c) || !Number.isInteger(r)) {
      setError(`Enter a column and row (${RANGE_HINT}).`);
      return;
    }
    if (c < 1 || c > GRID_SIZE || r < 1 || r > GRID_SIZE) {
      setError(`Use values between 1 and ${GRID_SIZE}.`);
      return;
    }
    // 1-indexed display → 0-indexed internal.
    onJump(c - 1, r - 1);
  }

  function onlyDigits(value: string): string {
    return value.replace(/[^0-9]/g, "");
  }

  return (
    <div className="mx-auto mb-4 max-w-md rounded-xl bg-white/80 p-3 ring-1 ring-rose-100/80 backdrop-blur-sm sm:p-4">
      <div className="mb-3 flex flex-col items-center gap-1">
        <MonoTag>Jump To</MonoTag>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Coordinate on the wall
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor="jump-col"
            className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600"
          >
            Col
          </label>
          <input
            id="jump-col"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={3}
            value={col}
            onChange={(e) => {
              setCol(onlyDigits(e.target.value));
              if (error) setError(null);
            }}
            placeholder="1"
            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-center font-mono text-sm tabular-nums focus:border-rose-300 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="jump-row"
            className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600"
          >
            Row
          </label>
          <input
            id="jump-row"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={3}
            value={row}
            onChange={(e) => {
              setRow(onlyDigits(e.target.value));
              if (error) setError(null);
            }}
            placeholder="1"
            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-center font-mono text-sm tabular-nums focus:border-rose-300 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition hover:bg-zinc-800"
        >
          Jump
        </button>
      </form>
      {error && (
        <p
          className="mt-2 text-center text-xs text-rose-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
