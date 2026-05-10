import Link from "next/link";

export const metadata = { title: "Privacy · The Colour Wall" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Back to the wall
      </Link>
      <h1 className="mt-6 font-serif text-3xl text-zinc-900 sm:text-4xl">
        Privacy
      </h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-700">
        <p>
          The Colour Wall doesn&apos;t track you. There are no accounts, no
          analytics trackers, no third-party tracking pixels.
        </p>
        <p>
          Stripe handles all payment processing. We never see your card
          details. Stripe stores standard transaction info on their side per
          their own privacy policy.
        </p>
        <p>
          If you choose to add a name, message, or link to your square, that
          text becomes publicly visible on the wall. Don&apos;t include
          anything you wouldn&apos;t want public.
        </p>
        <p>
          Server logs include standard request information (timestamp, route,
          IP address) for debugging and abuse prevention. They are not used
          to build profiles or shared with third parties.
        </p>
        <p>
          Questions? Email{" "}
          <a
            href="mailto:05austinwong@gmail.com"
            className="font-mono text-rose-600 hover:underline"
          >
            05austinwong@gmail.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
