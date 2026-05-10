"use client";

import { useState } from "react";

type Props = {
  x: number;
  y: number;
  priceCents: number;
  onClose: () => void;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function isValidLink(s: string): boolean {
  if (s === "") return true;
  try {
    const u = new URL(s);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ClaimDialog({ x, y, priceCents, onClose }: Props) {
  const [color, setColor] = useState("#3b82f6");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dollars = (priceCents / 100).toFixed(2);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!HEX_COLOR.test(color)) {
      setError("Pick a valid color.");
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
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, color, name, link }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setSubmitting(false);
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
      aria-label={`Claim square ${x}, ${y}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Claim square ({x}, {y})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        <label className="mb-3 flex items-center gap-3">
          <span className="w-20 text-sm text-zinc-700">Color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-zinc-300"
            aria-label="Color"
          />
          <code className="text-xs text-zinc-500">{color}</code>
        </label>

        <label className="mb-3 flex flex-col gap-1">
          <span className="text-sm text-zinc-700">Name (optional)</span>
          <input
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. yourname"
            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </label>

        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm text-zinc-700">Link (optional, https://)</span>
          <input
            type="url"
            value={link}
            maxLength={200}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </label>

        {error && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? "Redirecting…" : `Pay $${dollars}`}
          </button>
        </div>
      </form>
    </div>
  );
}
