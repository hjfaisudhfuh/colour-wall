"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { useEffect, useState } from "react";

type Props = {
  baseUrl: string;
  /** 0-indexed coords from the success URL params (?x=&y=). Either may be null. */
  x: number | null;
  y: number | null;
};

export function SuccessActions({ baseUrl, x, y }: Props) {
  const [copied, setCopied] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState(baseUrl);

  useEffect(() => {
    if (!resolvedUrl && typeof window !== "undefined") {
      setResolvedUrl(window.location.origin);
    }
  }, [resolvedUrl]);

  // Build a coord-aware share text when x/y are known. Falls back to a generic
  // line so /success without coords still works (e.g. someone bookmarked it).
  const hasCoord = x !== null && y !== null;
  const coordPhrase = hasCoord ? `square ${x + 1},${y + 1}` : "a square";
  const shareText =
    `I claimed ${coordPhrase} on The Colour Wall. Claim one next to mine. ${resolvedUrl || ""}`.trim();
  const nativeShareText = `I claimed ${coordPhrase} on The Colour Wall. Claim one next to mine.`;

  const shareType = hasCoord ? "single" : "batch";

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "The Colour Wall",
          text: nativeShareText,
          url: resolvedUrl || undefined,
        });
        track("share_button_clicked", { method: "native", type: shareType });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("share_button_clicked", { method: "clipboard", type: shareType });
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
