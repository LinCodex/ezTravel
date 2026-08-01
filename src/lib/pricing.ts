// Tiered markup: cheap plans carry full margin, expensive plans stay sellable.
const TIERS: Array<{ maxCost: number; multiplier: number }> = [
  { maxCost: 3, multiplier: 2.5 },
  { maxCost: 10, multiplier: 2.2 },
  { maxCost: 25, multiplier: 1.9 },
  { maxCost: 50, multiplier: 1.6 },
  { maxCost: Infinity, multiplier: 1.4 },
];

/** Round up to the nearest .49 / .99 ending. */
export function prettyPrice(raw: number): number {
  const base = Math.floor(raw);
  const frac = raw - base;
  if (frac <= 0.49) return base + 0.49;
  if (frac <= 0.99) return base + 0.99;
  return base + 1.49;
}

export function computeSellPrice(costUsd: number): number {
  const tier = TIERS.find((t) => costUsd <= t.maxCost)!;
  const raw = costUsd * tier.multiplier;
  return Math.max(0.99, prettyPrice(raw));
}
