"use client";

import type { ClaimedSquare } from "@/app/api/squares/route";
import { FEELING_LABELS, isFeelingCategory, safeUrl } from "@/lib/validation";

type Props = {
  square: ClaimedSquare;
  onClose: () => void;
};

export function SquarePopover({ square, onClose }: Props) {
  const href = safeUrl(square.link);
  const label = isFeelingCategory(square.feeling_category)
    ? FEELING_LABELS[square.feeling_category]
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Square ${square.x}, ${square.y}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <div className="mb-4 flex items-start gap-3">
          <div
            className="h-10 w-10 flex-shrink-0 rounded-full shadow ring-2 ring-white"
            style={{ backgroundColor: square.color }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            {label && (
              <div className="text-[11px] uppercase tracking-[0.16em] text-rose-700/80">
                {label}
              </div>
            )}
            <div className="text-xs text-zinc-500">
              Square {square.x},{square.y}
            </div>
          </div>
          <button
            type="button"
            className="text-zinc-400 hover:text-zinc-900"
            onClick={onClose}
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {square.message ? (
          <p className="font-serif text-xl leading-snug text-zinc-800 break-words">
            &ldquo;{square.message}&rdquo;
          </p>
        ) : !square.name && !href ? (
          <p className="text-sm italic text-zinc-500">A quiet square.</p>
        ) : null}

        {square.name && (
          <p className="mt-3 text-sm text-zinc-600">— {square.name}</p>
        )}

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-3 inline-block break-all text-sm text-rose-600 underline-offset-2 hover:underline"
          >
            {href}
          </a>
        )}
      </div>
    </div>
  );
}
