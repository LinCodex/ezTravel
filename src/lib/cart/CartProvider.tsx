"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "eztravel_cart_v1";

export type CartItem = {
  /** Stable line id: planId + days */
  key: string;
  planId: string;
  name: string;
  region: string;
  dataType: string;
  gb: number;
  validityDays: number;
  priceUsd: number;
  days: number;
  qty: number;
};

export type CartAddInput = Omit<CartItem, "key" | "qty" | "days"> & {
  days?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (input: CartAddInput) => void;
  removeItem: (key: string) => void;
  setDays: (key: string, days: number) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(planId: string, days: number) {
  return `${planId}:${days}`;
}

function lineTotal(item: CartItem) {
  const isDaily = item.dataType === "Daily Unlimited";
  const unit = item.priceUsd * (isDaily ? item.days : 1);
  return Math.round(unit * item.qty * 100) / 100;
}

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && typeof i.planId === "string" && typeof i.qty === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((input: CartAddInput) => {
    const isDaily = input.dataType === "Daily Unlimited";
    const days = isDaily ? Math.min(Math.max(input.days ?? 5, 1), 90) : 1;
    const key = lineKey(input.planId, days);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(i.qty + 1, 20) } : i
        );
      }
      return [
        ...prev,
        {
          key,
          planId: input.planId,
          name: input.name,
          region: input.region,
          dataType: input.dataType,
          gb: input.gb,
          validityDays: input.validityDays,
          priceUsd: input.priceUsd,
          days,
          qty: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setDays = useCallback((key: string, days: number) => {
    const nextDays = Math.min(Math.max(Math.floor(days), 1), 90);
    setItems((prev) => {
      const item = prev.find((i) => i.key === key);
      if (!item || item.dataType !== "Daily Unlimited") return prev;
      const newKey = lineKey(item.planId, nextDays);
      const without = prev.filter((i) => i.key !== key);
      const mergeTarget = without.find((i) => i.key === newKey);
      if (mergeTarget) {
        return without.map((i) =>
          i.key === newKey
            ? { ...i, qty: Math.min(i.qty + item.qty, 20) }
            : i
        );
      }
      return [...without, { ...item, key: newKey, days: nextDays }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const next = Math.min(Math.max(Math.floor(qty), 1), 20);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: next } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );
  const subtotal = useMemo(
    () => Math.round(items.reduce((sum, i) => sum + lineTotal(i), 0) * 100) / 100,
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      setDays,
      setQty,
      clear,
    }),
    [items, count, subtotal, addItem, removeItem, setDays, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      count: 0,
      subtotal: 0,
      addItem: () => {},
      removeItem: () => {},
      setDays: () => {},
      setQty: () => {},
      clear: () => {},
    };
  }
  return ctx;
}

export function cartLineTotal(item: CartItem): number {
  return lineTotal(item);
}
