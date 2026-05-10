// Tiny pixel-art examples illustrating what a claimed square (or a few
// neighbouring squares) can become. Pure CSS grid, no images, no JS.

const HEART = [
  ".RR..RR.",
  "RRRRRRRR",
  "RRRRRRRR",
  ".RRRRRR.",
  "..RRRR..",
  "...RR...",
  "........",
  "........",
];

const SMILEY = [
  "..YYYY..",
  ".YYYYYY.",
  "YYKYYKYY",
  "YYYYYYYY",
  "YKYYYYKY",
  "YYKKKKYY",
  ".YYYYYY.",
  "..YYYY..",
];

const LETTER_A = [
  "...AA...",
  "..AAAA..",
  ".AA..AA.",
  ".AA..AA.",
  ".AAAAAA.",
  ".AA..AA.",
  ".AA..AA.",
  "........",
];

const COLOR_MAP: Record<string, string> = {
  R: "#ef4444", // red
  Y: "#facc15", // yellow
  K: "#1f2937", // near-black
  A: "#3b82f6", // blue
};

function PixelExample({
  pattern,
  caption,
}: {
  pattern: string[];
  caption: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        aria-hidden
        className="grid h-16 w-16 overflow-hidden rounded-md ring-1 ring-rose-100"
        style={{
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
        }}
      >
        {pattern.flatMap((rowStr, y) =>
          Array.from(rowStr).map((ch, x) => (
            <div
              key={`${x}-${y}`}
              style={{ backgroundColor: COLOR_MAP[ch] ?? "transparent" }}
            />
          )),
        )}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {caption}
      </span>
    </div>
  );
}

export function MakeYourMark() {
  return (
    <section className="mx-auto my-16 max-w-3xl px-4">
      <div className="rounded-3xl bg-white/70 p-8 text-center ring-1 ring-rose-100 backdrop-blur-sm sm:p-10">
        <h2 className="font-serif text-3xl text-zinc-900 sm:text-4xl">
          Make your mark
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-700">
          Claim one square, or come back for neighbouring squares to build
          pixel art, initials, hearts, flags, inside jokes, or a tiny ad.
        </p>

        <div className="mt-7 flex items-start justify-center gap-6">
          <PixelExample pattern={HEART} caption="a heart" />
          <PixelExample pattern={SMILEY} caption="a face" />
          <PixelExample pattern={LETTER_A} caption="initials" />
        </div>

        <a
          href="#wall"
          className="mt-7 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Start with one square
        </a>
      </div>
    </section>
  );
}
