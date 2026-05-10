import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CancelPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-20 text-center">
      <h1 className="font-serif text-3xl text-zinc-900 sm:text-4xl">
        No colour left this time.
      </h1>
      <p className="text-zinc-700">
        No charge was made. Your square hold will release shortly so you (or
        someone else) can try again.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block self-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Back to the wall
      </Link>
    </main>
  );
}
