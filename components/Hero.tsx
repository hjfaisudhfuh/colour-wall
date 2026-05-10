import { MonoTag } from "./MonoTag";

export function Hero() {
  return (
    <section className="px-4 pb-10 pt-16 text-center sm:pt-24">
      <div className="mb-6 flex justify-center">
        <MonoTag>The First Wall · 100 × 100</MonoTag>
      </div>

      <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-zinc-900 sm:text-7xl">
        Claim a tiny piece of the{" "}
        <span className="italic text-rose-600">internet</span>.
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base text-zinc-700 sm:text-lg">
        A public wall anyone can add to. Pick a colour and leave a name,
        message, link, logo, joke, or tiny ad. Claim nearby squares to build
        pixel art.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href="#wall"
          className="inline-block rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:bg-zinc-800"
        >
          Pick your square
        </a>
        <p className="text-xs text-zinc-500">
          $1 per square · No account · Yours forever
        </p>
      </div>
    </section>
  );
}
