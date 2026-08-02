/** Approximate combined state sales-tax rates for partner wholesale quotes. */
export const STATE_TAX_RATES: Record<string, { name: string; rate: number }> = {
  AL: { name: "Alabama", rate: 0.04 },
  AK: { name: "Alaska", rate: 0 },
  AZ: { name: "Arizona", rate: 0.056 },
  AR: { name: "Arkansas", rate: 0.065 },
  CA: { name: "California", rate: 0.0725 },
  CO: { name: "Colorado", rate: 0.029 },
  CT: { name: "Connecticut", rate: 0.0635 },
  DE: { name: "Delaware", rate: 0 },
  FL: { name: "Florida", rate: 0.06 },
  GA: { name: "Georgia", rate: 0.04 },
  HI: { name: "Hawaii", rate: 0.04 },
  ID: { name: "Idaho", rate: 0.06 },
  IL: { name: "Illinois", rate: 0.0625 },
  IN: { name: "Indiana", rate: 0.07 },
  IA: { name: "Iowa", rate: 0.06 },
  KS: { name: "Kansas", rate: 0.065 },
  KY: { name: "Kentucky", rate: 0.06 },
  LA: { name: "Louisiana", rate: 0.0445 },
  ME: { name: "Maine", rate: 0.055 },
  MD: { name: "Maryland", rate: 0.06 },
  MA: { name: "Massachusetts", rate: 0.0625 },
  MI: { name: "Michigan", rate: 0.06 },
  MN: { name: "Minnesota", rate: 0.06875 },
  MS: { name: "Mississippi", rate: 0.07 },
  MO: { name: "Missouri", rate: 0.04225 },
  MT: { name: "Montana", rate: 0 },
  NE: { name: "Nebraska", rate: 0.055 },
  NV: { name: "Nevada", rate: 0.0685 },
  NH: { name: "New Hampshire", rate: 0 },
  NJ: { name: "New Jersey", rate: 0.06625 },
  NM: { name: "New Mexico", rate: 0.05125 },
  NY: { name: "New York", rate: 0.04 },
  NC: { name: "North Carolina", rate: 0.0475 },
  ND: { name: "North Dakota", rate: 0.05 },
  OH: { name: "Ohio", rate: 0.0575 },
  OK: { name: "Oklahoma", rate: 0.045 },
  OR: { name: "Oregon", rate: 0 },
  PA: { name: "Pennsylvania", rate: 0.06 },
  RI: { name: "Rhode Island", rate: 0.07 },
  SC: { name: "South Carolina", rate: 0.06 },
  SD: { name: "South Dakota", rate: 0.042 },
  TN: { name: "Tennessee", rate: 0.07 },
  TX: { name: "Texas", rate: 0.0625 },
  UT: { name: "Utah", rate: 0.0485 },
  VT: { name: "Vermont", rate: 0.06 },
  VA: { name: "Virginia", rate: 0.053 },
  WA: { name: "Washington", rate: 0.065 },
  WV: { name: "West Virginia", rate: 0.06 },
  WI: { name: "Wisconsin", rate: 0.05 },
  WY: { name: "Wyoming", rate: 0.04 },
  DC: { name: "District of Columbia", rate: 0.06 },
};

/**
 * Coarse ZIP3 → state map for partner store tax. Covers common ranges;
 * unknown ZIPs fall back to 0 tax with empty state.
 */
const ZIP3_RANGES: Array<{ start: number; end: number; state: string }> = [
  { start: 10, end: 27, state: "MA" },
  { start: 28, end: 29, state: "RI" },
  { start: 30, end: 38, state: "NH" },
  { start: 39, end: 49, state: "ME" },
  { start: 50, end: 59, state: "VT" },
  { start: 60, end: 69, state: "CT" },
  { start: 70, end: 89, state: "NJ" },
  { start: 100, end: 149, state: "NY" },
  { start: 150, end: 196, state: "PA" },
  { start: 197, end: 199, state: "DE" },
  { start: 200, end: 205, state: "DC" },
  { start: 206, end: 219, state: "MD" },
  { start: 220, end: 246, state: "VA" },
  { start: 247, end: 268, state: "WV" },
  { start: 270, end: 289, state: "NC" },
  { start: 290, end: 299, state: "SC" },
  { start: 300, end: 319, state: "GA" },
  { start: 320, end: 349, state: "FL" },
  { start: 350, end: 369, state: "AL" },
  { start: 370, end: 385, state: "TN" },
  { start: 386, end: 397, state: "MS" },
  { start: 400, end: 427, state: "KY" },
  { start: 430, end: 458, state: "OH" },
  { start: 460, end: 479, state: "IN" },
  { start: 480, end: 499, state: "MI" },
  { start: 500, end: 528, state: "IA" },
  { start: 530, end: 549, state: "WI" },
  { start: 550, end: 567, state: "MN" },
  { start: 570, end: 577, state: "SD" },
  { start: 580, end: 588, state: "ND" },
  { start: 590, end: 599, state: "MT" },
  { start: 600, end: 629, state: "IL" },
  { start: 630, end: 658, state: "MO" },
  { start: 660, end: 679, state: "KS" },
  { start: 680, end: 693, state: "NE" },
  { start: 700, end: 714, state: "LA" },
  { start: 716, end: 729, state: "AR" },
  { start: 730, end: 749, state: "OK" },
  { start: 750, end: 799, state: "TX" },
  { start: 800, end: 816, state: "CO" },
  { start: 820, end: 831, state: "WY" },
  { start: 832, end: 838, state: "ID" },
  { start: 840, end: 847, state: "UT" },
  { start: 850, end: 865, state: "AZ" },
  { start: 870, end: 884, state: "NM" },
  { start: 889, end: 898, state: "NV" },
  { start: 900, end: 961, state: "CA" },
  { start: 967, end: 968, state: "HI" },
  { start: 970, end: 979, state: "OR" },
  { start: 980, end: 994, state: "WA" },
  { start: 995, end: 999, state: "AK" },
];

export function stateFromZip(zip: string): string {
  const digits = zip.replace(/\D/g, "").slice(0, 5);
  if (digits.length < 3) return "";
  const zip3 = parseInt(digits.slice(0, 3), 10);
  if (Number.isNaN(zip3)) return "";
  const hit = ZIP3_RANGES.find((r) => zip3 >= r.start && zip3 <= r.end);
  return hit?.state ?? "";
}

export function taxRateForZip(zip: string): { state: string; rate: number; stateName: string } {
  const state = stateFromZip(zip);
  const info = state ? STATE_TAX_RATES[state] : undefined;
  return {
    state,
    rate: info?.rate ?? 0,
    stateName: info?.name ?? "",
  };
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}
