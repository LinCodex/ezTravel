"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { cartCount, readCart, type PartnerCartItem } from "@/lib/partner/cart";

const Ctx = createContext({ count: 0, items: [] as PartnerCartItem[], refresh: () => {} });

export function PartnerCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PartnerCartItem[]>([]);

  function refresh() {
    setItems(readCart());
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("partner-cart-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("partner-cart-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return (
    <Ctx.Provider value={{ count: cartCount(items), items, refresh }}>{children}</Ctx.Provider>
  );
}

export function usePartnerCart() {
  return useContext(Ctx);
}
