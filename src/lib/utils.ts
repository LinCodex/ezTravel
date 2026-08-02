export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatData(gb: number): string {
  if (gb < 1) return `${Math.round(gb * 1000)}MB`;
  return `${gb}GB`;
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomRefToken(length: number): string {
  // crypto when available (Node / modern browsers); Math.random fallback for edge cases
  const bytes =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? crypto.getRandomValues(new Uint8Array(length))
      : Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
  let out = "";
  for (let i = 0; i < length; i++) {
    out += REF_ALPHABET[bytes[i]! % REF_ALPHABET.length];
  }
  return out;
}

/** Consumer order reference, e.g. EZ-K7M2PQ */
export function generateOrderRef(): string {
  return `EZ-${randomRefToken(8)}`;
}

/** Partner order reference, e.g. PO-9X4H2MQL */
export function generatePartnerOrderRef(): string {
  return `PO-${randomRefToken(8)}`;
}

/** Partner top-up invoice number, e.g. INV-R3K9W2MH */
export function generateInvNumber(): string {
  return `INV-${randomRefToken(8)}`;
}

export function generateCartGroup(): string {
  return `CG-${randomRefToken(8)}`;
}
