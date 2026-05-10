import type { ClaimedSquare } from "@/app/api/squares/route";
import { FEELING_LABELS, isFeelingCategory, safeUrl } from "@/lib/validation";
import { formatCoord } from "@/lib/coords";

type Props = { squares: ClaimedSquare[] };

export function LatestMarks({ squares }: Props) {
  if (squares.length === 0) {
    return (
      <section className="mx-auto my-16 max-w-3xl px-4 text-center">
        <p className="font-serif text-xl text-zinc-700 sm:text-2xl">
          Be one of the first people on the wall.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto my-16 max-w-5xl px-4">
      <div className="mb-6 text-center">
        <h2 className="font-serif text-3xl text-zinc-900 sm:text-4xl">
          Latest claims
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Most recent claims on the wall.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {squares.map((s) => {
          const vibe = isFeelingCategory(s.feeling_category)
            ? FEELING_LABELS[s.feeling_category]
            : null;
          const href = safeUrl(s.link);

          return (
            <article
              key={`${s.x},${s.y}`}
              className="rounded-xl bg-white/80 p-4 ring-1 ring-rose-100/80 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-sm ring-1 ring-black/10"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] tabular-nums text-zinc-600">
                  {formatCoord(s.x, s.y)}
                </span>
                {vibe && (
                  <span className="text-[11px] text-zinc-400">· {vibe}</span>
                )}
              </div>

              {s.message && (
                <p className="mt-3 font-serif text-lg leading-snug text-zinc-800 break-words">
                  &ldquo;{s.message}&rdquo;
                </p>
              )}

              {(s.name || href) && (
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>{s.name ? `— ${s.name}` : ""}</span>
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-rose-600 underline-offset-2 hover:underline"
                    >
                      link
                    </a>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
