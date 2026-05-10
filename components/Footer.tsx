import Link from "next/link";

// Placeholder contact email — replace with your real address before going live.
const CONTACT_EMAIL = "hello@example.com";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-rose-100/70 px-4 py-10 text-center text-xs text-zinc-500">
      <p className="font-serif text-sm text-zinc-700">
        The Colour Wall · a public canvas made one square at a time
      </p>
      <p className="mt-2">
        Secure payments by Stripe · No account · No tracking
      </p>
      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="hover:text-zinc-900"
        >
          Contact
        </a>
        <span aria-hidden className="text-zinc-300">
          ·
        </span>
        <Link href="/privacy" className="hover:text-zinc-900">
          Privacy
        </Link>
        <span aria-hidden className="text-zinc-300">
          ·
        </span>
        <Link href="/terms" className="hover:text-zinc-900">
          Terms
        </Link>
        <span aria-hidden className="text-zinc-300">
          ·
        </span>
        <Link href="/refunds" className="hover:text-zinc-900">
          Refunds
        </Link>
      </nav>
    </footer>
  );
}
