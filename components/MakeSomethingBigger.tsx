export function MakeSomethingBigger() {
  return (
    <section className="mx-auto my-16 max-w-3xl px-4">
      <div className="rounded-3xl bg-white/70 p-8 text-center ring-1 ring-rose-100 backdrop-blur-sm sm:p-10">
        <h2 className="font-serif text-3xl text-zinc-900 sm:text-4xl">
          Make something bigger
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-700">
          Claim neighbouring squares to create initials, hearts, flags,
          symbols, pixel art, or secret messages with your friends.
        </p>
        <a
          href="#wall"
          className="mt-6 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Start with one square
        </a>
      </div>
    </section>
  );
}
