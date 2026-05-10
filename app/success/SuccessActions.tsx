"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { baseUrl: string };

export function SuccessActions({ baseUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState(baseUrl);

  useEffect(() => {
    if (!resolvedUrl && typeof window !== "undefined") {
      setResolvedUrl(window.location.origin);
    }
  }, [resolvedUrl]);

  const shareText = `I claimed a square on The Colour Wall. ${resolvedUrl || ""}`.trim();

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "The Colour Wall",
          text: "I claimed a square on The Colour Wall.",
          url: resolvedUrl || undefined,
        });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — leave button as-is
    }
  }

  return (
    <div className="mt-6 flex flex-col items-stretch gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full bg-rose-500 px-5 py-3.5 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-600"
      >
        {copied ? "Copied!" : "Share The Colour Wall"}
      </button>
      <Link
        href="/"
        className="rounded-full bg-zinc-900 px-5 py-3.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Back to the wall
      </Link>
    </div>
  );
}
