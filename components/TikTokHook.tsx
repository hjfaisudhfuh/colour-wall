const STEPS = [
  "Claim a square",
  "Screenshot it",
  "Post your coordinate",
  "Tell someone to claim next to yours",
];

const EXAMPLES = [
  "67,58 was here.",
  "Claim one next to mine.",
  "Build a heart with your friends.",
];

export function TikTokHook() {
  return (
    <section className="mx-auto my-12 max-w-2xl px-4">
      <div className="rounded-2xl bg-rose-50/80 p-6 text-center ring-1 ring-rose-100 backdrop-blur-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-700/80">
          From TikTok? Try this
        </p>

        <ol className="mx-auto mt-3 flex max-w-md flex-col gap-1 text-left text-sm text-zinc-800 sm:text-base">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="font-mono text-zinc-400 tabular-nums">
                {i + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm italic text-zinc-600">
          {EXAMPLES.map((quote, i) => (
            <li key={quote} className="flex items-center gap-3">
              <span>&ldquo;{quote}&rdquo;</span>
              {i < EXAMPLES.length - 1 && (
                <span aria-hidden className="text-zinc-300">
                  ·
                </span>
              )}
            </li>
          ))}
        </ul>

        <a
          href="#wall"
          className="mt-5 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Claim your square
        </a>
      </div>
    </section>
  );
}
