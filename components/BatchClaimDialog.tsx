"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { formatCoord } from "@/lib/coords";
import { PRICE_CENTS } from "@/lib/constants";

type Props = {
  /** 0-indexed coords. */
  coords: { x: number; y: number }[];
  onClose: () => void;
  onClaimError?: () => void;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const PRESET_COLORS = [
  "#f9a8d4",
  "#fb7185",
  "#f97316",
  "#facc15",
  "#84cc16",
  "#22d3ee",
  "#3b82f6",
  "#8b5cf6",
  "#0f172a",
  "#ffffff",
];

const PLACEHOLDERS = [
  "Building something here.",
  "Pixel art for a friend.",
  "Our corner of the wall.",
  "First wall, founding chunk.",
];

function isValidLink(s: string): boolean {
  if (s === "") return true;
  try {
    const u = new URL(s);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function BatchClaimDialog({ coords, onClose, onClaimError }: Props) {
  const [color, setColor] = useState<string>("#f9a8d4");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)],
    [],
  );

  const totalDollars = ((PRICE_CENTS * coords.length) / 100).toFixed(2);
  const messageRemaining = 100 - message.length;

  // Lock background scroll while modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Compact preview of selected coords (first 5 + count).
  const coordPreview = useMemo(() => {
    const first = coords.slice(0, 5).map((c) => formatCoord(c.x, c.y));
    if (coords.length <= 5) return first.join(", ");
    return `${first.join(", ")} and ${coords.length - 5} more`;
  }, [coords]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!HEX_COLOR.test(color)) {
      setError("Pick a valid colour.");
      return;
    }
    if (message.length > 100) {
      setError("Message must be 100 characters or fewer.");
      return;
    }
    if (name.length > 50) {
      setError("Name must be 50 characters or fewer.");
      return;
    }
    if (link.length > 200) {
      setError("Link must be 200 characters or fewer.");
      return;
    }
    if (link && !isValidLink(link)) {
      setError("Link must start with https://");
      return;
    }

    setSubmitting(true);
    track("batch_checkout_started", {
      count: coords.length,
      has_message: message.length > 0,
      has_name: name.length > 0,
      has_link: link.length > 0,
    });
    try {
      const res = await fetch("/api/checkout/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords, color, message, name, link }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setSubmitting(false);
        if (res.status === 409 && onClaimError) onClaimError();
        return;
      }
      window.location.assign(data.url);
    } catch (err) {
      console.error(err);
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Claim ${coords.length} squares`}
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:rounded-3xl"
      >
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-zinc-900">
              Claim {coords.length} squares
            </h2>
            <p className="mt-1 text-sm font-medium tabular-nums text-zinc-700">
              {coordPreview}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Same colour, message, name, and link applied to all {coords.length}{" "}
          squares.
        </p>

        {/* Colour */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            Colour
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`pick colour ${c}`}
                className={`h-8 w-8 rounded-full ring-1 ring-black/10 transition ${
                  color.toLowerCase() === c.toLowerCase()
                    ? "scale-110 ring-2 ring-rose-500"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label className="ml-1 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-600">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-5 w-5 cursor-pointer rounded-full border-none bg-transparent p-0"
                aria-label="custom colour"
              />
              custom
            </label>
          </div>
        </div>

        {/* Message */}
        <div className="mt-5">
          <label
            htmlFor="batch-message"
            className="mb-2 flex items-center justify-between text-sm font-medium text-zinc-800"
          >
            <span>
              Message{" "}
              <span className="font-normal text-zinc-400">(optional)</span>
            </span>
            <span className="text-xs font-normal text-zinc-400">
              {messageRemaining} left
            </span>
          </label>
          <textarea
            id="batch-message"
            value={message}
            maxLength={100}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-rose-300 focus:outline-none"
          />
        </div>

        {/* Name */}
        <div className="mt-4">
          <label
            htmlFor="batch-name"
            className="mb-2 block text-sm font-medium text-zinc-800"
          >
            Display name <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            id="batch-name"
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="anonymous"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-rose-300 focus:outline-none"
          />
        </div>

        {/* Link */}
        <div className="mt-4">
          <label
            htmlFor="batch-link"
            className="mb-2 block text-sm font-medium text-zinc-800"
          >
            Link <span className="text-zinc-400">(optional, https://)</span>
          </label>
          <input
            id="batch-link"
            type="url"
            value={link}
            maxLength={200}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-rose-300 focus:outline-none"
          />
        </div>

        {error && (
          <p
            className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:translate-y-0 disabled:opacity-60"
        >
          {submitting
            ? "Redirecting…"
            : `Claim ${coords.length} squares — $${totalDollars}`}
        </button>

        <p className="mt-3 text-center text-xs text-zinc-500">
          Secure checkout by Stripe. Your squares appear after payment.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-full px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800"
          disabled={submitting}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
