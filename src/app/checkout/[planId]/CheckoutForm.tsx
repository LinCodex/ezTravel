"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrustStrip } from "@/components/TrustStrip";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatCnyApprox } from "@/lib/destinations-meta";
import { formatData, formatUsd } from "@/lib/utils";

interface CheckoutPlan {
  id: string;
  name: string;
  region: string;
  dataType: string;
  gb: number;
  validityDays: number;
  priceUsd: number;
}

type PaymentMethod = "ZELLE" | "WECHAT" | "SQUARE";

export function CheckoutForm({ plan }: { plan: CheckoutPlan }) {
  const { t, locale } = useLanguage();
  const router = useRouter();

  const isDaily = plan.dataType === "Daily Unlimited";
  const [days, setDays] = useState(isDaily ? 5 : 1);
  const [email, setEmail] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("ZELLE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = plan.priceUsd * (isDaily ? days : 1);

  const methods: Array<{ id: PaymentMethod; name: string; desc: string }> = [
    { id: "ZELLE", name: t.checkout.zelle, desc: t.checkout.zelleDesc },
    { id: "WECHAT", name: t.checkout.wechatPay, desc: t.checkout.wechatPayDesc },
    { id: "SQUARE", name: t.checkout.square, desc: t.checkout.squareDesc },
  ];

  async function placeOrder() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.checkout.emailRequired);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          days: isDaily ? days : 1,
          email,
          wechatId: wechatId || undefined,
          paymentMethod: method,
        }),
      });
      if (!res.ok) throw new Error("order failed");
      const data = await res.json();
      router.push(`/order/${data.orderRef}?email=${encodeURIComponent(email)}`);
    } catch {
      setError(t.common.error);
      setSubmitting(false);
    }
  }

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-medium animate-fade-up">
          {t.checkout.title}
        </h1>
        <div className="animate-fade-up delay-100">
          <TrustStrip />
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-8 animate-fade-up delay-100">
          <p className="text-white text-lg font-medium">
            {regionDisplayName(plan.region, locale)} · {formatData(plan.gb)}
            {isDaily ? t.plan.perDay : ""}
          </p>
          <p className="text-white/50 text-xs mt-1">
            {isDaily
              ? t.plan.dailyUnlimited
              : `${t.plan.fixedData} · ${t.plan.validity}: ${plan.validityDays} ${t.plan.days}`}
          </p>

          {isDaily && (
            <div className="mt-5">
              <label className="text-white/70 text-sm">{t.checkout.daysLabel}</label>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {[1, 3, 5, 7, 10, 15, 20, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`text-sm rounded-full px-4 py-2 transition-all duration-300 btn-press ${
                      days === d
                        ? "bg-white text-black"
                        : "bg-neutral-800 text-neutral-300 hover:text-white"
                    }`}
                  >
                    {d} {t.plan.days}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-200">
          <p className="text-white text-sm font-medium">{t.checkout.whatYouGetTitle}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {t.checkout.whatYouGet.map((item) => (
              <li key={item} className="text-white/60 text-sm flex gap-2.5">
                <span className="text-white/30 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-200">
          <p className="text-white text-sm font-medium">{t.checkout.contact}</p>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-white/70 text-xs">{t.checkout.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none focus:ring-1 focus:ring-white/30"
                placeholder="you@example.com"
              />
              <p className="text-white/40 text-[11px] mt-1">{t.checkout.emailHint}</p>
            </div>
            <div>
              <label className="text-white/70 text-xs">{t.checkout.wechat}</label>
              <input
                value={wechatId}
                onChange={(e) => setWechatId(e.target.value)}
                className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none focus:ring-1 focus:ring-white/30"
                placeholder="wechat_id"
              />
              <p className="text-white/40 text-[11px] mt-1">{t.checkout.wechatHint}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-300">
          <p className="text-white text-sm font-medium">{t.checkout.payment}</p>
          <div className="mt-4 flex flex-col gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`text-left rounded-xl px-4 py-3 transition-colors border ${
                  method === m.id
                    ? "border-white bg-neutral-800"
                    : "border-transparent bg-neutral-800/50 hover:bg-neutral-800"
                }`}
              >
                <p className="text-white text-sm font-medium">{m.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 animate-fade-up delay-400">
          <div>
            <p className="text-white text-xl font-medium">
              {t.checkout.total}: {formatUsd(total)}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {t.checkout.usdNote} · {t.checkout.cnyApprox} {formatCnyApprox(total).replace("≈", "")}
            </p>
          </div>
          <button
            onClick={placeOrder}
            disabled={submitting}
            className="bg-white text-black text-sm rounded-full px-8 py-3.5 hover:bg-neutral-200 transition-colors disabled:opacity-50 btn-press"
          >
            {submitting ? t.checkout.placing : t.checkout.placeOrder}
          </button>
        </div>

        <p className="text-center mt-6 animate-fade-up delay-500">
          <Link
            href="/compatibility"
            className="text-white/40 hover:text-white text-xs underline underline-offset-4 transition-colors"
          >
            {t.checkout.checkCompat}
          </Link>
        </p>
      </div>
    </section>
  );
}
