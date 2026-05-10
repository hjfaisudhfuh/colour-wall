const STEPS = [
  {
    n: "1",
    title: "Pick a square",
    body: "Tap any empty cell on the wall.",
  },
  {
    n: "2",
    title: "Choose a colour, add a message",
    body: "Or just a colour. Or your initials. Or a link to your thing.",
  },
  {
    n: "3",
    title: "Pay $1",
    body: "Your square is yours forever. Want more? Claim neighbouring squares.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto my-16 max-w-5xl px-4">
      <h2 className="mb-8 text-center font-serif text-3xl text-zinc-900 sm:text-4xl">
        How it works
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl bg-white/70 p-6 ring-1 ring-rose-100 backdrop-blur-sm"
          >
            <div className="font-serif text-3xl text-rose-500">{s.n}</div>
            <h3 className="mt-2 font-medium text-zinc-900">{s.title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        No account. Just a colour, a square, and your mark.
      </p>
    </section>
  );
}
