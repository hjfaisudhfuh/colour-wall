/**
 * Format a 0-indexed cell coordinate for display.
 * Internally we work in 0..GRID_SIZE-1 (URL params, DB, Stripe metadata) but
 * humans count from 1, so we shift here at the render boundary.
 */
export function formatCoord(x: number, y: number): string {
  return `Column ${x + 1} · Row ${y + 1}`;
}
