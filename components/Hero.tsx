type Props = {
  claimedCount: number;
  totalCount: number;
};

export function Hero({ claimedCount, totalCount }: Props) {
  return (
    <section className="px-4 pb-10 pt-16 text-center sm:pt-24">
      <p className="mb-6 inline-block rounded-full bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-rose-700/80 ring-1 ring-rose-100 backdrop-blur">
        A public canvas · one square at a time
      </p>

      <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-zinc-900 sm:text-7xl">
        Leave your <span className="italic text-rose-600">colour</span> on the
        internet.
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base text-zinc-700 sm:text-lg">
        Claim a tiny square on a public canvas. Pick a colour, add a message
        or link, or build something bigger one square at a time.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href="#wall"
          className="inline-block rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:bg-zinc-800"
        >
          Pick your square
        </a>
        <p className="text-xs text-zinc-500">
          $1 a square · No account · Yours forever
        </p>
        <p className="text-xs text-zinc-400">
          {claimedCount.toLocaleString()} of{" "}
          {totalCount.toLocaleString()} squares claimed
        </p>
      </div>
    </section>
  );
}
