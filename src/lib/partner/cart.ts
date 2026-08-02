export type PartnerCartItem = {
  planId: string;
  name: string;
  region: string;
  regionCode?: string;
  type: string;
  networks: string;
  dataLabel: string;
  validityDays: number;
  unitPrice: number;
  suggestedRetail: number;
  quantity: number;
};

const KEY = "ez_partner_cart";

export function readCart(): PartnerCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PartnerCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: PartnerCartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("partner-cart-changed"));
}

export function cartCount(items: PartnerCartItem[] = readCart()) {
  return items.reduce((s, i) => s + i.quantity, 0);
}

export function addToCart(item: Omit<PartnerCartItem, "quantity">, qty = 1) {
  const cart = readCart();
  const existing = cart.find((c) => c.planId === item.planId);
  if (existing) existing.quantity += qty;
  else cart.push({ ...item, quantity: qty });
  writeCart(cart);
  return cart;
}

export function updateQty(planId: string, quantity: number) {
  const cart = readCart().map((c) => (c.planId === planId ? { ...c, quantity } : c));
  writeCart(cart.filter((c) => c.quantity > 0));
}

export function removeFromCart(planId: string) {
  writeCart(readCart().filter((c) => c.planId !== planId));
}

export function clearCart() {
  writeCart([]);
}
