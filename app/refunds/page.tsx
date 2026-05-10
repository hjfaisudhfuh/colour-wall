import Link from "next/link";

export const metadata = { title: "Refunds · The Colour Wall" };

export default function RefundsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Back to the wall
      </Link>
      <h1 className="mt-6 font-serif text-3xl text-zinc-900 sm:text-4xl">
        Refunds
      </h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-700">
        <p>
          Successfully claimed squares are non-refundable. Once your square
          is on the wall, the slot is taken from the limited 10,000
          available, and the cost has been incurred.
        </p>
        <p>
          If you were charged but your square never appeared on the wall,
          contact us within 7 days and we&apos;ll refund the charge.
        </p>
        <p>
          For accidental duplicate charges or technical errors, contact us
          within 7 days.
        </p>
        <p>
          We can&apos;t refund a square because you changed your mind about
          the colour, message, or location.
        </p>
        <p>
          To request a refund, email{" "}
          <a
            href="mailto:hello@example.com"
            className="font-mono text-rose-600 hover:underline"
          >
            hello@example.com
          </a>{" "}
          with your Stripe receipt and a brief description.
        </p>
      </div>
    </main>
  );
}
