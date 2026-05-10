type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Small bracketed monospace badge used as section/utility labels across the
 * site. Reads as internet/console chrome, not as soft brand UI.
 *
 *   <MonoTag>The First Wall</MonoTag>  →  [ THE FIRST WALL ]
 *
 * Brackets are aria-hidden so screen readers don't say
 * "left square bracket the first wall right square bracket".
 */
export function MonoTag({ children, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-zinc-500 ${className}`}
    >
      <span aria-hidden className="mr-1.5">[</span>
      <span>{children}</span>
      <span aria-hidden className="ml-1.5">]</span>
    </span>
  );
}
