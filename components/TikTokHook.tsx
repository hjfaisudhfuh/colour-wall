export function TikTokHook() {
  return (
    <section className="mx-auto my-12 max-w-2xl px-4">
      <div className="rounded-2xl bg-rose-50/80 p-6 text-center ring-1 ring-rose-100 backdrop-blur-sm">
        <p className="font-serif text-xl text-zinc-800 sm:text-2xl">
          Coming from TikTok? Pick a colour. Leave your mark.
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          A square for a song, a person, your initials — or just because.
        </p>
        <a
          href="#wall"
          className="mt-4 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Claim your square
        </a>
      </div>
    </section>
  );
}
