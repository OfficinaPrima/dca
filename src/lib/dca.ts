/** New blended average cost after buying `buyShares` at `price`. */
export function blendedAverage(
  shares: number,
  avg: number,
  buyShares: number,
  price: number,
): number {
  const total = shares + buyShares;
  if (total <= 0) return 0;
  return (shares * avg + buyShares * price) / total;
}

/**
 * Shares to buy at `price` so the blended average becomes `targetAvg`.
 * Returns 0 when no purchase is needed, null when impossible (price === targetAvg).
 */
export function sharesForTargetAverage(
  shares: number,
  avg: number,
  price: number,
  targetAvg: number,
): number | null {
  if (price === targetAvg) return null;
  const n = (shares * (targetAvg - avg)) / (price - targetAvg);
  return n > 0 ? n : 0;
}

/**
 * To break even after a `bouncePct`% rise from `price`, the average must be
 * pulled down to price * (1 + bouncePct/100). Returns the shares to buy for that.
 */
export function sharesForBounceBreakeven(
  shares: number,
  avg: number,
  price: number,
  bouncePct: number,
): number {
  const target = price * (1 + bouncePct / 100);
  return sharesForTargetAverage(shares, avg, price, target) ?? 0;
}

/** Bounce % needed to break even with no additional buying. */
export function breakevenBounceNoBuy(avg: number, price: number): number {
  if (price <= 0) return 0;
  return ((avg - price) / price) * 100;
}
