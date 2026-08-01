"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrustStrip } from "@/components/TrustStrip";
import { cartLineTotal, useCart } from "@/lib/cart/CartProvider";
import { formatCnyApprox } from "@/lib/destinations-meta";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatData, formatUsd } from "@/lib/utils";

type PaymentMethod = "ZELLE" | "WECHAT" | "SQUARE";

export function CartContent() {
  const { t, locale } = useLanguage();
  const { items, subtotal, removeItem, setDays, setQty, clear } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("ZELLE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods: Array<{ id: PaymentMethod; name: string; desc: string }> = [
    { id: "ZELLE", name: t.checkout.zelle, desc: t.checkout.zelleDesc },
    { id: "WECHAT", name: t.checkout.wechatPay, desc: t.checkout.wechatPayDesc },
    { id: "SQUARE", name: t.checkout.square, desc: t.checkout.squareDesc },
  ];

  async function checkoutAll() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.checkout.emailRequired);
      return;
    }
    if (items.length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            planId: i.planId,
            days: i.days,
            qty: i.qty,
          })),
          email,
          wechatId: wechatId || undefined,
          paymentMethod: method,
        }),
      });
      if (!res.ok) throw new Error("order failed");
      const data = await res.json();
      clear();
      if (data.cartGroup) {
        router.push(
          `/order/group/${data.cartGroup}?email=${encodeURIComponent(email)}`
        );
      } else {
        router.push(
          `/order/${data.orderRef}?email=${encodeURIComponent(email)}`
        );
      }
    } catch {
      setError(t.common.error);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-medium">
            {t.cart.title}
          </h1>
          <p className="text-white/60 text-sm mt-6">{t.cart.empty}</p>
          <Link
            href="/destinations"
            className="inline-block mt-6 bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors btn-press"
          >
            {t.cart.emptyCta}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-medium animate-fade-up">
          {t.cart.title}
        </h1>
        <p className="text-white/60 text-sm mt-3 animate-fade-up delay-100">
          {t.cart.subtitle}
        </p>
        <div className="animate-fade-up delay-100">
          <TrustStrip />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {items.map((item) => {
            const isDaily = item.dataType === "Daily Unlimited";
            const line = cartLineTotal(item);
            return (
              <div
                key={item.key}
                className="bg-neutral-900/80 rounded-2xl p-5 ring-1 ring-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white text-base font-medium">
                      {regionDisplayName(item.region, locale)} ·{" "}
                      {formatData(item.gb)}
                      {isDaily ? t.plan.perDay : ""}
                    </p>
                    <p className="text-white/45 text-xs mt-1">
                      {isDaily
                        ? t.plan.dailyUnlimited
                        : `${t.plan.fixedData} · ${t.plan.validity}: ${item.validityDays} ${t.plan.days}`}
                    </p>
                    <p className="text-white/35 text-[11px] mt-1">
                      {t.cart.each} {formatUsd(item.priceUsd)}
                      {isDaily ? t.plan.perDay : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-white/40 hover:text-white text-xs transition-colors shrink-0"
                  >
                    {t.cart.remove}
                  </button>
                </div>

                {isDaily && (
                  <div className="mt-4">
                    <p className="text-white/50 text-xs mb-2">{t.cart.days}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 3, 5, 7, 10, 15, 20, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDays(item.key, d)}
                          className={`text-xs rounded-full px-3 py-1.5 transition-colors btn-press ${
                            item.days === d
                              ? "bg-white text-black"
                              : "bg-neutral-800 text-white/60 hover:text-white"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs">{t.cart.qty}</span>
                    <button
                      type="button"
                      onClick={() =>
                        item.qty <= 1
                          ? removeItem(item.key)
                          : setQty(item.key, item.qty - 1)
                      }
                      className="h-8 w-8 rounded-full bg-neutral-800 text-white/80 hover:text-white"
                      aria-label="decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-6 text-center">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.qty + 1)}
                      className="h-8 w-8 rounded-full bg-neutral-800 text-white/80 hover:text-white"
                      aria-label="increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">
                      {formatUsd(line)}
                    </p>
                    <p className="text-white/30 text-[10px]">
                      {formatCnyApprox(line)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">{t.cart.subtotal}</p>
            <div className="text-right">
              <p className="text-white text-xl font-medium">
                {formatUsd(subtotal)}
              </p>
              <p className="text-white/30 text-xs">{formatCnyApprox(subtotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
          <p className="text-white text-sm font-medium">{t.checkout.contact}</p>
          <label className="block mt-4">
            <span className="text-white/50 text-xs">{t.checkout.email}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full bg-neutral-950 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/40"
              placeholder="you@email.com"
            />
            <span className="text-white/30 text-[11px] mt-1 block">
              {t.checkout.emailHint}
            </span>
          </label>
          <label className="block mt-4">
            <span className="text-white/50 text-xs">{t.checkout.wechat}</span>
            <input
              type="text"
              value={wechatId}
              onChange={(e) => setWechatId(e.target.value)}
              className="mt-1.5 w-full bg-neutral-950 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/40"
            />
          </label>
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
          <p className="text-white text-sm font-medium">{t.checkout.payment}</p>
          <div className="mt-3 flex flex-col gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`text-left rounded-xl px-4 py-3 transition-colors ${
                  method === m.id
                    ? "bg-white text-black"
                    : "bg-neutral-950 text-white/70 hover:text-white"
                }`}
              >
                <p className="text-sm font-medium">{m.name}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    method === m.id ? "text-black/60" : "text-white/40"
                  }`}
                >
                  {m.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <button
          type="button"
          onClick={checkoutAll}
          disabled={submitting}
          className="mt-6 w-full bg-white text-black text-sm font-medium rounded-full px-6 py-4 hover:bg-neutral-200 transition-colors btn-press disabled:opacity-60"
        >
          {submitting
            ? t.cart.checkingOut
            : `${t.cart.checkoutAll} · ${formatUsd(subtotal)}`}
        </button>

        <div className="mt-4 text-center">
          <Link
            href="/destinations"
            className="text-white/50 hover:text-white text-sm underline underline-offset-4 transition-colors"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
      </div>
    </section>
  );
}
