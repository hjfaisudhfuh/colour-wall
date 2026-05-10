"use client";

import type { ClaimedSquare } from "@/app/api/squares/route";
import { safeUrl } from "@/lib/validation";

type Props = {
  square: ClaimedSquare;
  onClose: () => void;
};

export function SquarePopover({ square, onClose }: Props) {
  const href = safeUrl(square.link);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Square ${square.x}, ${square.y}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="h-8 w-8 rounded border border-zinc-300"
            style={{ backgroundColor: square.color }}
            aria-hidden
          />
          <div className="text-sm text-zinc-500">
            ({square.x}, {square.y})
          </div>
          <button
            type="button"
            className="ml-auto text-zinc-500 hover:text-zinc-900"
            onClick={onClose}
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {square.name && (
          <p className="mb-2 text-base font-medium break-words">
            {square.name}
          </p>
        )}

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all text-sm text-blue-600 underline hover:text-blue-800"
          >
            {href}
          </a>
        ) : (
          !square.name && (
            <p className="text-sm text-zinc-500">No details.</p>
          )
        )}
      </div>
    </div>
  );
}
