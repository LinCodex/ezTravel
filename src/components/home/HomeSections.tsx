"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { RegionFlag } from "@/components/RegionFlag";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatCnyApprox, getCardGradient } from "@/lib/destinations-meta";
import { formatUsd } from "@/lib/utils";

export interface DestinationSummary {
  region: string;
  regionSlug: string;
  minPrice: number;
  planCount: number;
}

export function PopularDestinations({
  destinations,
}: {
  destinations: DestinationSummary[];
}) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/destinations?q=${encodeURIComponent(query.trim())}` : "/destinations");
  }

  return (
    <section id="popular-destinations" className="bg-black px-5 md:px-10 py-16 md:py-28">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="hero-title text-4xl md:text-6xl font-medium">
            {t.home.popularTitle}
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base">
            {t.home.popularSubtitle}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <form onSubmit={search} className="mt-8 flex gap-2 max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="flex-1 bg-neutral-900 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/40 transition-shadow"
            />
            <button
              type="submit"
              className="bg-white text-black text-sm rounded-full px-6 py-3.5 hover:bg-neutral-200 transition-colors btn-press shrink-0"
              aria-label="search"
            >
              →
            </button>
          </form>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3 mt-10">
          {destinations.map((d, i) => (
            <Reveal key={d.regionSlug} delay={Math.min(i, 7) * 50}>
              <Link
                href={`/destinations/${d.regionSlug}`}
                className={`card-hover group rounded-2xl p-4 md:p-5 flex flex-col gap-3 md:gap-4 h-full bg-gradient-to-br ${getCardGradient(d.region, d.region.includes("&") || d.region.includes("(") ? "Multi-Area" : "Single")} ring-1 ring-white/10`}
              >
                <RegionFlag region={d.region} size="lg" />
                <div>
                  <p className="text-white text-sm md:text-base font-medium leading-tight">
                    {regionDisplayName(d.region, locale)}
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    {d.planCount} {t.home.plansCount}
                  </p>
                </div>
                <div className="mt-auto">
                  <p className="text-white text-sm font-medium">
                    {t.home.fromPrice} {formatUsd(d.minPrice)}
                  </p>
                  <p className="text-white/30 text-[10px]">{formatCnyApprox(d.minPrice)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-10">
            <Link
              href="/destinations"
              className="inline-block bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors btn-press"
            >
              {t.home.viewAll}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function WhyUs() {
  const { t } = useLanguage();

  const featureIcons = [
    // 01 Bilingual
    <svg key="0" className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" strokeWidth="2" />
    </svg>,
    // 02 Keep US number
    <svg key="1" className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <path d="M12 18h.01" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 7h6M9 10h6" strokeLinecap="round" />
    </svg>,
    // 03 Pay your way
    <svg key="2" className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
      <path d="M6 15h4" strokeWidth="2" strokeLinecap="round" />
    </svg>,
    // 04 Refund guarantee
    <svg key="3" className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>,
  ];

  return (
    <section className="bg-black px-5 md:px-10 py-20 md:py-32 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="hero-title text-4xl md:text-6xl font-medium tracking-tight">
                {t.home.whyTitle}
              </h2>
              <p className="text-white/70 mt-3 text-sm md:text-base max-w-xl">
                {t.home.whySubtitle}
              </p>
            </div>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-12">
          {t.home.features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card-hover bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between group transition-all">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                      {featureIcons[i]}
                    </div>
                    <span className="text-white/20 text-xs font-mono font-medium">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-white text-base font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-white/60 text-sm mt-2 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const { t } = useLanguage();

  return (
    <section className="bg-black px-5 md:px-10 py-20 md:py-32 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex text-amber-400 text-sm tracking-widest">★★★★★</div>
            <span className="text-xs text-white/50 font-medium">Verified Travelers</span>
          </div>
          <h2 className="hero-title text-4xl md:text-6xl font-medium tracking-tight">
            {t.home.reviewsTitle}
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base">
            {t.home.reviewsSubtitle}
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 mt-12">
          {t.home.reviews.map((r, i) => (
            <Reveal key={i} delay={i * 100}>
              <figure className="card-hover bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/10 rounded-2xl p-6 sm:p-7 h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-amber-400 text-xs tracking-widest" aria-label="5 stars">
                      ★★★★★
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      Verified Stay
                    </span>
                  </div>
                  <blockquote className="text-white/80 text-sm leading-relaxed mt-4">
                    “{r.text}”
                  </blockquote>
                </div>
                <figcaption className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{r.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{r.location}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs font-semibold">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PaymentMethods() {
  const { t } = useLanguage();
  const methods = [
    {
      name: t.checkout.zelle,
      note: t.home.paymentZelleNote,
      badge: "Manual · < 1 hr",
      color: "border-purple-500/30 hover:border-purple-500/60",
      icon: (
        <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: t.checkout.wechatPay,
      note: t.home.paymentWechatNote,
      badge: "Manual · < 1 hr",
      color: "border-emerald-500/30 hover:border-emerald-500/60",
      icon: (
        <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: "Credit / Debit Card",
      note: t.home.paymentSquareNote,
      badge: "Instant Confirmation",
      color: "border-blue-500/30 hover:border-blue-500/60",
      icon: (
        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-black px-5 md:px-10 py-20 md:py-32 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="hero-title text-4xl md:text-6xl font-medium tracking-tight">
            {t.home.paymentsTitle}
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base max-w-xl">
            {t.home.paymentsSubtitle}
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-4 mt-12">
          {methods.map((m, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className={`card-hover bg-neutral-900/60 hover:bg-neutral-900/90 rounded-2xl p-6 flex flex-col justify-between h-full border ${m.color} transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {m.icon}
                    </div>
                    <span className="text-[10px] text-white/70 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full font-medium">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-white text-lg font-semibold tracking-tight">{m.name}</p>
                  <p className="text-white/50 text-xs mt-1.5 leading-relaxed">{m.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="bg-black px-5 md:px-10 py-20 md:py-32 border-t border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <h2 className="hero-title text-4xl md:text-7xl font-medium">
            {t.home.ctaTitle}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-white/60 text-sm md:text-base mt-5 max-w-xl mx-auto">
            {t.home.ctaSubtitle}
          </p>
        </Reveal>
        <Reveal delay={220}>
          <Link
            href="/destinations"
            className="inline-block bg-white text-black text-sm md:text-base rounded-full px-8 py-4 mt-8 hover:bg-neutral-200 transition-colors btn-press"
          >
            {t.home.ctaButton}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
