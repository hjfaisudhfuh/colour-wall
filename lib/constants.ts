export const GRID_SIZE = 100;
export const RESERVATION_MINUTES = 30;

function readPriceCents(): number {
  const raw = process.env.PRICE_CENTS;
  if (!raw) return 100;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

export const PRICE_CENTS = readPriceCents();
