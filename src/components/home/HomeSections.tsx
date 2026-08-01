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
    <section className="bg-black px-5 md:px-10 py-16 md:py-28">
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

  return (
    <section className="bg-black px-5 md:px-10 py-16 md:py-28 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="hero-title text-4xl md:text-6xl font-medium">{t.home.whyTitle}</h2>
          <p className="text-white/70 mt-3 text-sm md:text-base">{t.home.whySubtitle}</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 mt-10">
          {t.home.features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card-hover bg-neutral-900/80 rounded-2xl p-6 h-full">
                <span className="text-white/30 text-sm font-medium tracking-widest">
                  0{i + 1}
                </span>
                <h3 className="text-white text-base font-medium mt-4">{f.title}</h3>
                <p className="text-white/60 text-sm mt-2 leading-relaxed">{f.text}</p>
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
    <section className="bg-black px-5 md:px-10 py-16 md:py-28 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="hero-title text-4xl md:text-6xl font-medium">
            {t.home.reviewsTitle}
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base">
            {t.home.reviewsSubtitle}
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-2.5 md:gap-3 mt-10">
          {t.home.reviews.map((r, i) => (
            <Reveal key={i} delay={i * 100}>
              <figure className="card-hover bg-neutral-900/80 rounded-2xl p-6 h-full flex flex-col">
                <div className="text-white/90 text-sm tracking-[0.2em]" aria-label="5 stars">
                  ★★★★★
                </div>
                <blockquote className="text-white/80 text-sm leading-relaxed mt-4 flex-1">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="text-white text-sm font-medium">{r.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{r.location}</p>
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
    { name: t.checkout.zelle, note: t.home.paymentZelleNote },
    { name: t.checkout.wechatPay, note: t.home.paymentWechatNote },
    { name: "square", note: t.home.paymentSquareNote },
  ];

  return (
    <section className="bg-black px-5 md:px-10 py-16 md:py-28 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="hero-title text-4xl md:text-6xl font-medium">
            {t.home.paymentsTitle}
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base max-w-xl">
            {t.home.paymentsSubtitle}
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-2.5 md:gap-3 mt-10">
          {methods.map((m, i) => (
            <Reveal key={m.name} delay={i * 80}>
              <div className="card-hover bg-neutral-900/80 rounded-2xl p-6 flex flex-col gap-2 h-full">
                <p className="text-white text-lg font-medium">{m.name}</p>
                <p className="text-white/50 text-xs">{m.note}</p>
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
