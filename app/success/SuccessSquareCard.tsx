type Props = {
  /** 0-indexed coord for single-square claims. Null for batch claims. */
  x: number | null;
  y: number | null;
  /** 1 for single, N for batch. */
  count: number;
  color: string;
  message: string | null;
  name: string | null;
};

/**
 * Visual proof of purchase shown on the /success page after a claim.
 * Mirrors the SquarePopover aesthetic — colour swatch + serif quote — so
 * the user has something to screenshot. Same component renders for both
 * single-square (shows the coord) and batch (shows the count) flows; for
 * batch we use the first square's metadata since every cell in a batch
 * shares the same colour/message/name.
 *
 * Pure presentational. No data fetching, no client state.
 */
export function SuccessSquareCard({
  x,
  y,
  count,
  color,
  message,
  name,
}: Props) {
  const showCoord = x !== null && y !== null && count === 1;
  const label = showCoord
    ? `${(x as number) + 1},${(y as number) + 1}`
    : `${count} squares`;

  return (
    <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-white p-5 text-left shadow-lg ring-1 ring-rose-100">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 flex-shrink-0 rounded-full shadow ring-2 ring-white"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums text-rose-700/80">
            {label}
          </div>
          <div className="text-xs text-zinc-500">on The First Wall</div>
        </div>
      </div>

      {message && (
        <p className="mt-3 font-serif text-base leading-snug text-zinc-800 break-words">
          &ldquo;{message}&rdquo;
        </p>
      )}

      {name && (
        <p className="mt-2 text-xs text-zinc-500">— {name}</p>
      )}
    </div>
  );
}
