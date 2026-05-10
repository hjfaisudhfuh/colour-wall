import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CancelPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Checkout cancelled</h1>
      <p className="text-zinc-600">
        No charge was made. Your square hold will expire shortly so you (or
        someone else) can try again.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Back to the grid
      </Link>
    </main>
  );
}
