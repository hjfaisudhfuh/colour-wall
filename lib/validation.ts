import { z } from "zod";
import { GRID_SIZE } from "./constants";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// Strip ASCII control chars (0x00-0x1f and 0x7f) to defang malicious names.
const CONTROL_CHARS = /[\x00-\x1f\x7f]/g;

export const checkoutBodySchema = z.object({
  x: z.number().int().min(0).max(GRID_SIZE - 1),
  y: z.number().int().min(0).max(GRID_SIZE - 1),
  color: z.string().regex(HEX_COLOR, "color must be #rrggbb"),
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
