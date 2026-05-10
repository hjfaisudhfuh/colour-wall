// Compact 4-step strip. Sits above the wall as quick orientation for first-
// time visitors. Wraps to multiple lines on narrow screens via flex-wrap.

const STEPS = [
  { n: "1", label: "Pick a square" },
  { n: "2", label: "Choose a colour" },
  { n: "3", label: "Pay $1" },
  { n: "4", label: "On the wall" },
];

export function HowItWorks() {
  return (
    <div className="mx-auto mb-4 max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {STEPS.map((step, i) => (
          <span key={step.n} className="flex items-center gap-3">
            <span>
              <span className="font-semibold text-zinc-700">{step.n}</span>{" "}
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="text-zinc-300">
                →
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
