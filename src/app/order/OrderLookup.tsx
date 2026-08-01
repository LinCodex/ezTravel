"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function OrderLookup() {
  const { t } = useLanguage();
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setLoading(true);
    setError(null);
    const cleanRef = ref.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(
      `/api/orders/${encodeURIComponent(cleanRef)}?email=${encodeURIComponent(cleanEmail)}`
    );
    if (res.ok) {
      router.push(`/order/${cleanRef}?email=${encodeURIComponent(cleanEmail)}`);
    } else {
      setError(t.order.lookupNotFound);
      setLoading(false);
    }
  }

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-md mx-auto">
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-medium animate-fade-up">
          {t.order.lookupTitle}
        </h1>
        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-8 flex flex-col gap-4 animate-fade-up delay-100">
          <div>
            <label className="text-white/70 text-xs">{t.order.lookupRef}</label>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none focus:ring-1 focus:ring-white/30"
              placeholder="EZ-ABC123"
            />
          </div>
          <div>
            <label className="text-white/70 text-xs">{t.order.lookupEmail}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white mt-1 outline-none focus:ring-1 focus:ring-white/30"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={lookup}
            disabled={loading || !ref.trim() || !email.trim()}
            className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50 btn-press"
          >
            {loading ? t.common.loading : t.order.lookupButton}
          </button>
        </div>
      </div>
    </section>
  );
}
