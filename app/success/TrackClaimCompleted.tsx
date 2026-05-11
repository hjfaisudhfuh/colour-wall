"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

type Props = {
  type: "single" | "batch";
  count: number;
};

/**
 * Fires the `claim_completed` analytics event once when the success page
 * mounts. Server-rendered success page can't call track() directly (it's
 * client-only), so we wrap a no-render component around the effect.
 *
 * Only mounted by app/success/page.tsx when a real claim is detected
 * (valid x/y or valid batch UUID) — so direct hits to /success without
 * params don't fire spurious events.
 */
export function TrackClaimCompleted({ type, count }: Props) {
  useEffect(() => {
    track("claim_completed", { type, count });
    // Run once per page load. type/count are stable for a given mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
