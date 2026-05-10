import { z } from "zod";
import { GRID_SIZE } from "./constants";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// Strip ASCII control chars (0x00-0x1f and 0x7f) to defang malicious text.
const CONTROL_CHARS = /[\x00-\x1f\x7f]/g;

// Listed in the order they appear in the dropdown — creative/casual first, then
// emotional, then "other" as a final catch-all. The DB column is still named
// feeling_category for backwards compatibility; user-facing label is "Vibe".
export const FEELING_CATEGORIES = [
  "art",
  "tribute",
  "shoutout",
  "memory",
  "fun",
  "love",
  "happy",
  "hope",
  "grateful",
  "nostalgic",
  "missing",
  "healing",
  "heartbreak",
  "lost",
  "other",
] as const;

export type FeelingCategory = (typeof FEELING_CATEGORIES)[number];

export const FEELING_LABELS: Record<FeelingCategory, string> = {
  art: "Art",
  tribute: "Tribute",
  shoutout: "Shout-out",
  memory: "Memory",
  fun: "Just for fun",
  love: "Love",
  happy: "Happy",
  hope: "Hope",
  grateful: "Grateful",
  nostalgic: "Nostalgic",
  missing: "Missing someone",
  healing: "Healing",
  heartbreak: "Heartbreak",
  lost: "Lost",
  other: "Other",
};

export function isFeelingCategory(s: unknown): s is FeelingCategory {
  return typeof s === "string" && (FEELING_CATEGORIES as readonly string[]).includes(s);
}

export const checkoutBodySchema = z.object({
  x: z.number().int().min(0).max(GRID_SIZE - 1),
  y: z.number().int().min(0).max(GRID_SIZE - 1),
  color: z.string().regex(HEX_COLOR, "color must be #rrggbb"),
  feeling_category: z.enum(FEELING_CATEGORIES).optional(),
  message: z
    .string()
    .max(100)
    .transform((s) => s.replace(CONTROL_CHARS, "").trim())
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .max(50)
    .transform((s) => s.replace(CONTROL_CHARS, "").trim())
    .optional()
    .or(z.literal("")),
  link: z
    .string()
    .max(200)
    .refine((s) => s === "" || isSafeHttpsUrl(s), "link must be an https:// URL")
    .optional()
    .or(z.literal("")),
});

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;

export function isSafeHttpsUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Render-time defense in depth — never emit a non-https href. */
export function safeUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  return isSafeHttpsUrl(input) ? input : null;
}
