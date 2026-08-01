"use client";

import Link from "next/link";
import { useState } from "react";
import { cartLineTotal, useCart } from "@/lib/cart/CartProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatData, formatUsd } from "@/lib/utils";

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3.5 5h1.6l1.4 11.2a1.5 1.5 0 0 0 1.5 1.3h9.3a1.5 1.5 0 0 0 1.5-1.2L20.5 8H7" />
      <circle cx="9.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CartNavButton({ scrolled }: { scrolled: boolean }) {
  const { t, locale } = useLanguage();
  const { items, count, subtotal } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href="/cart"
        className={`relative flex items-center justify-center backdrop-blur text-neutral-300 hover:text-white transition-colors rounded-full p-3 btn-press ${
          scrolled ? "bg-black/85 ring-1 ring-white/10" : "bg-neutral-900/90"
        }`}
        aria-label={`${t.nav.cart}${count > 0 ? `, ${count}` : ""}`}
      >
        <CartIcon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-medium flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>

      <div
        className={`absolute right-0 top-full pt-2 w-[min(20rem,calc(100vw-2rem))] transition-all duration-200 ${
          open
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="rounded-2xl bg-neutral-950/95 backdrop-blur-xl ring-1 ring-white/15 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
            <p className="text-white text-sm font-medium">{t.cart.title}</p>
            <p className="text-white/40 text-xs">
              {count} {t.cart.items}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-6">
              <p className="text-white/50 text-sm">{t.cart.empty}</p>
              <Link
                href="/destinations"
                className="inline-block mt-3 text-white text-xs underline underline-offset-4 hover:text-white/70"
              >
                {t.cart.emptyCta}
              </Link>
            </div>
          ) : (
            <>
              <ul className="max-h-64 overflow-y-auto h-scroll divide-y divide-white/5">
                {items.map((item) => {
                  const isDaily = item.dataType === "Daily Unlimited";
                  const line = cartLineTotal(item);
                  return (
                    <li key={item.key} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                            {regionDisplayName(item.region, locale)} ·{" "}
                            {formatData(item.gb)}
                            {isDaily ? t.plan.perDay : ""}
                          </p>
                          <p className="text-white/40 text-[11px] mt-1">
                            {isDaily
                              ? `${item.days} ${t.plan.days}`
                              : `${item.validityDays} ${t.plan.days}`}
                            {item.qty > 1 ? ` · ×${item.qty}` : ""}
                          </p>
                        </div>
                        <p className="text-white text-xs font-medium shrink-0">
                          {formatUsd(line)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="px-4 py-3 border-t border-white/10 bg-black/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white/50 text-xs">{t.cart.subtotal}</p>
                  <p className="text-white text-sm font-medium">
                    {formatUsd(subtotal)}
                  </p>
                </div>
                <Link
                  href="/cart"
                  className="mt-3 block w-full text-center bg-white text-black text-xs font-medium rounded-full px-4 py-2.5 hover:bg-neutral-200 transition-colors btn-press"
                >
                  {t.cart.viewCart}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
