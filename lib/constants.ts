export const GRID_SIZE = 100;
export const RESERVATION_MINUTES = 30;

// Max number of squares a single batch checkout can include. Schema allows
// up to 100; we cap at 50 in the API for MVP (≈ $50 max single transaction).
export const MAX_BATCH_SIZE = 50;

function readPriceCents(): number {
  const raw = process.env.PRICE_CENTS;
  if (!raw) return 100;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

export const PRICE_CENTS = readPriceCents();
