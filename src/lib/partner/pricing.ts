import { roundMoney, taxRateForZip } from "@/lib/tax/us-state-rates";

/** Partner wholesale before tax: Access cost + 50% markup. */
export function wholesalePrice(costUsd: number): number {
  return roundMoney(costUsd * 1.5);
}

export function taxForZip(zip: string, amountUsd: number): {
  taxUsd: number;
  state: string;
  rate: number;
} {
  const { state, rate } = taxRateForZip(zip);
  return {
    taxUsd: roundMoney(amountUsd * rate),
    state,
    rate,
  };
}

export function partnerUnitPrice(costUsd: number, storeZip: string): {
  wholesale: number;
  tax: number;
  total: number;
  state: string;
  rate: number;
} {
  const wholesale = wholesalePrice(costUsd);
  const { taxUsd, state, rate } = taxForZip(storeZip, wholesale);
  return {
    wholesale,
    tax: taxUsd,
    total: roundMoney(wholesale + taxUsd),
    state,
    rate,
  };
}

export function suggestedRetail(partnerUnitTotal: number, markupPercent: number): number {
  return roundMoney(partnerUnitTotal * (1 + markupPercent / 100));
}

export function dataLabel(gb: number, dataType: string): string {
  if (dataType === "Daily Unlimited") return `${gb} GB/day`;
  if (gb >= 1) return `${gb} GB`;
  return `${Math.round(gb * 1024)} MB`;
}

export function coverageBucket(type: string, region: string): "country" | "regional" | "global" {
  const r = region.toLowerCase();
  if (r.includes("global") || r.includes("world")) return "global";
  if (type === "Multi-Area" || r.includes("europe") || r.includes("asia") || r.includes("africa") || r.includes("latin")) {
    return "regional";
  }
  return "country";
}
