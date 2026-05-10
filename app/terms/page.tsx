import Link from "next/link";

export const metadata = { title: "Terms · The Colour Wall" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Back to the wall
      </Link>
      <h1 className="mt-6 font-serif text-3xl text-zinc-900 sm:text-4xl">
        Terms
      </h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-700">
        <p>
          One square on The Colour Wall costs $1 (USD). Each successful claim
          reserves one specific (column, row) on the 100×100 first wall.
        </p>
        <p>
          Your square&apos;s colour, optional message, optional name, and
          optional link become publicly visible after payment is confirmed.
        </p>
        <p>
          You&apos;re responsible for the content you submit. Don&apos;t post
          anything illegal, infringing, harassing, NSFW, hateful, or designed
          to deceive. We may remove content that violates these rules without
          a refund.
        </p>
        <p>
          By claiming a square you confirm you own (or have rights to) any
          name, link, or message you submit.
        </p>
        <p>
          See our{" "}
          <Link
            href="/refunds"
            className="text-rose-600 hover:underline"
          >
            refunds policy
          </Link>{" "}
          for refund details.
        </p>
      </div>
    </main>
  );
}
