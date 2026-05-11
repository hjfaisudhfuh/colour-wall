"use client";

type Props = {
  selectMode: boolean;
  selectedCount: number;
  onToggle: () => void;
  onClear: () => void;
};

/**
 * Small bar above the wall mat that toggles select mode and shows current
 * selection count. Visible whether or not selectMode is active so the
 * toggle is always discoverable.
 */
export function WallToolbar({
  selectMode,
  selectedCount,
  onToggle,
  onClear,
}: Props) {
  return (
    <div className="mx-auto mb-3 flex max-w-md flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className={
          selectMode
            ? "rounded-full bg-zinc-900 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white transition hover:bg-zinc-800"
            : "rounded-full bg-white/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-700 ring-1 ring-rose-100 backdrop-blur transition hover:bg-white"
        }
      >
        {selectMode ? "Done selecting" : "Select multiple"}
      </button>
      {selectMode && selectedCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          Clear ({selectedCount})
        </button>
      )}
    </div>
  );
}
