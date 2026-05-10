/**
 * Format a 0-indexed cell coordinate for display.
 * Internally we work in 0..GRID_SIZE-1 (URL params, DB, Stripe metadata) but
 * humans count from 1, so we shift here at the render boundary.
 *
 * Display format is the compact "X,Y" used by old internet pixel walls — short
 * enough to fit anywhere (hover pill, modal subtitle, popover header).
 */
export function formatCoord(x: number, y: number): string {
  return `${x + 1},${y + 1}`;
}
