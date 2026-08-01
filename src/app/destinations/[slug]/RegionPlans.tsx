"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { RegionFlag } from "@/components/RegionFlag";
import { StaggerGrid } from "@/components/StaggerGrid";
import { TrustStrip } from "@/components/TrustStrip";
import { useCart } from "@/lib/cart/CartProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatCnyApprox, getRegionIntro } from "@/lib/destinations-meta";
import { formatData, formatUsd } from "@/lib/utils";

export interface PlanSummary {
  id: string;
  name: string;
  dataType: string;
  gb: number;
  validityDays: number;
  priceUsd: number;
  speed: string;
  networks: string;
  coverage: string;
  fupPolicy: string;
}

type Tab = "daily" | "total";
type DataBucket = "any" | "small" | "medium" | "large";
type ValidityBucket = "any" | "week" | "twoweeks" | "month";
type Sort = "priceLow" | "priceHigh" | "dataHigh";

function pickRecommended(plans: PlanSummary[]): PlanSummary | null {
  if (plans.length === 0) return null;
  const scored = [...plans].map((p) => {
    let score = 0;
    // Prefer ~1–3GB for typical trips
    if (p.gb >= 1 && p.gb <= 3) score += 3;
    else if (p.gb > 3 && p.gb <= 5) score += 2;
    if (p.dataType === "Daily Unlimited") score += 2;
    if (p.speed.includes("5G")) score += 1;
    if (p.validityDays === 7 || p.validityDays === 1) score += 1;
    // Prefer mid-low price
    score += Math.max(0, 5 - p.priceUsd / 2);
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.p ?? null;
}

export function RegionPlans({
  region,
  plans,
}: {
  region: string;
  plans: PlanSummary[];
}) {
  const { t, locale } = useLanguage();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  function addPlanToCart(p: PlanSummary) {
    addItem({
      planId: p.id,
      name: p.name,
      region,
      dataType: p.dataType,
      gb: p.gb,
      validityDays: p.validityDays,
      priceUsd: p.priceUsd,
      days: p.dataType === "Daily Unlimited" ? 5 : 1,
    });
    setAddedId(p.id);
    window.setTimeout(() => setAddedId((cur) => (cur === p.id ? null : cur)), 1600);
  }

  const daily = useMemo(
    () => plans.filter((p) => p.dataType === "Daily Unlimited"),
    [plans]
  );
  const total = useMemo(
    () => plans.filter((p) => p.dataType !== "Daily Unlimited"),
    [plans]
  );

  const [tab, setTab] = useState<Tab>(daily.length > 0 ? "daily" : "total");
  const [dataBucket, setDataBucket] = useState<DataBucket>("any");
  const [validityBucket, setValidityBucket] = useState<ValidityBucket>("any");
  const [fiveG, setFiveG] = useState(false);
  const [sort, setSort] = useState<Sort>("priceLow");
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [stickyPlanId, setStickyPlanId] = useState<string | null>(null);

  const source = tab === "daily" ? daily : total;
  const recommended = useMemo(() => pickRecommended(source), [source]);
  const intro = getRegionIntro(region, locale);

  const allNetworks = useMemo(() => {
    const set = new Set<string>();
    for (const p of plans) {
      p.networks
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
        .forEach((n) => set.add(n));
    }
    return [...set];
  }, [plans]);

  const coverageCodes = useMemo(() => {
    const set = new Set<string>();
    for (const p of plans) {
      p.coverage
        .split(/[,/]/)
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => set.add(c));
    }
    return [...set];
  }, [plans]);

  const filtered = useMemo(() => {
    const result = source.filter((p) => {
      if (dataBucket === "small" && !(p.gb <= 1)) return false;
      if (dataBucket === "medium" && !(p.gb > 1 && p.gb <= 5)) return false;
      if (dataBucket === "large" && !(p.gb > 5)) return false;
      if (tab === "total") {
        if (validityBucket === "week" && !(p.validityDays <= 7)) return false;
        if (
          validityBucket === "twoweeks" &&
          !(p.validityDays > 7 && p.validityDays <= 15)
        )
          return false;
        if (validityBucket === "month" && !(p.validityDays > 15)) return false;
      }
      if (fiveG && !p.speed.includes("5G")) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sort === "priceLow") return a.priceUsd - b.priceUsd;
      if (sort === "priceHigh") return b.priceUsd - a.priceUsd;
      return b.gb - a.gb;
    });
    return result;
  }, [source, dataBucket, validityBucket, fiveG, sort, tab]);

  const comparePlans = useMemo(
    () => compareIds.map((id) => plans.find((p) => p.id === id)).filter(Boolean) as PlanSummary[],
    [compareIds, plans]
  );

  const stickyPlan =
    plans.find((p) => p.id === stickyPlanId) ?? recommended ?? filtered[0] ?? null;

  const hasActiveFilters = dataBucket !== "any" || validityBucket !== "any" || fiveG;

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  const dataOptions: Array<{ id: DataBucket; label: string }> = [
    { id: "any", label: t.plan.filterAny },
    { id: "small", label: "≤ 1GB" },
    { id: "medium", label: "2–5GB" },
    { id: "large", label: "5GB+" },
  ];
  const validityOptions: Array<{ id: ValidityBucket; label: string }> = [
    { id: "any", label: t.plan.filterAny },
    { id: "week", label: `≤ 7 ${t.plan.days}` },
    { id: "twoweeks", label: `8–15 ${t.plan.days}` },
    { id: "month", label: `30 ${t.plan.days}` },
  ];
  const sortOptions: Array<{ id: Sort; label: string }> = [
    { id: "priceLow", label: t.plan.sortPriceLow },
    { id: "priceHigh", label: t.plan.sortPriceHigh },
    { id: "dataHigh", label: t.plan.sortDataHigh },
  ];

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-28 md:pb-20 flex-1">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <Link
            href="/destinations"
            className="text-white/50 hover:text-white transition-colors text-sm"
          >
            ← {t.browse.title}
          </Link>
          <div className="flex items-center gap-3 md:gap-4 mt-4">
            <RegionFlag region={region} size="lg" />
            <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-medium">
              {regionDisplayName(region, locale)}
            </h1>
          </div>
          {intro && (
            <p className="text-white/60 text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
              {intro}
            </p>
          )}
          <TrustStrip />
          <p className="text-white/30 text-[11px] mt-3">
            {t.plan.usdNote} · {t.plan.cnyApprox}
          </p>
        </Reveal>

        {/* Coverage panel */}
        <Reveal delay={60}>
          <div className="mt-8 bg-neutral-900/80 ring-1 ring-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setCoverageOpen(!coverageOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-white text-sm font-medium">
                {t.plan.coverageTitle}
              </span>
              <span className="text-white/40 text-xs">
                {coverageOpen ? t.plan.coverageHide : t.plan.coverageShow}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                coverageOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-white/5 pt-4">
                  {allNetworks.length > 0 && (
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                        {t.plan.networks}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {allNetworks.map((n) => (
                          <span
                            key={n}
                            className="text-xs text-white/70 bg-white/5 rounded-full px-3 py-1"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {coverageCodes.length > 0 && (
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                        {t.plan.coverage}
                      </p>
                      <p className="text-white/60 text-sm">{coverageCodes.join(" · ")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Recommended plan */}
        {recommended && (
          <Reveal delay={100}>
            <div className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-neutral-900 to-neutral-950 ring-1 ring-white/20 p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <span className="text-[10px] uppercase tracking-widest bg-white text-black rounded-full px-2.5 py-1 font-medium">
                    {t.plan.recommendedBadge}
                  </span>
                  <p className="text-white/50 text-xs mt-3">{t.plan.recommendedTitle}</p>
                  <p className="text-white text-2xl font-medium hero-title mt-1">
                    {formatData(recommended.gb)}
                    {recommended.dataType === "Daily Unlimited" ? t.plan.perDay : ""}
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    {recommended.dataType === "Daily Unlimited"
                      ? t.plan.dailyUnlimited
                      : `${t.plan.validity}: ${recommended.validityDays} ${t.plan.days}`}
                    {recommended.speed.includes("5G") ? " · 5G" : ""}
                  </p>
                  {recommended.networks && (
                    <p className="text-white/40 text-xs mt-2 line-clamp-1">
                      {recommended.networks}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-white text-2xl font-medium">
                      {formatUsd(recommended.priceUsd)}
                      {recommended.dataType === "Daily Unlimited" && (
                        <span className="text-white/40 text-sm">{t.plan.perDay}</span>
                      )}
                    </p>
                    <p className="text-white/30 text-xs">
                      {formatCnyApprox(recommended.priceUsd)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addPlanToCart(recommended)}
                      className="bg-neutral-800 text-white text-sm rounded-full px-5 py-3 hover:bg-neutral-700 transition-colors btn-press ring-1 ring-white/10"
                    >
                      {addedId === recommended.id
                        ? t.plan.addedToCart
                        : t.plan.addToCart}
                    </button>
                    <Link
                      href={`/checkout/${recommended.id}`}
                      className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors btn-press"
                    >
                      {t.plan.recommendedCta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={120}>
          <div className="mt-8 flex items-center gap-1 bg-neutral-900 rounded-full px-1.5 py-1.5 self-start w-fit max-w-full overflow-x-auto">
            {daily.length > 0 && (
              <button
                onClick={() => setTab("daily")}
                className={`text-xs md:text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 btn-press ${
                  tab === "daily" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
                }`}
              >
                {t.plan.dailyUnlimited} ({daily.length})
              </button>
            )}
            {total.length > 0 && (
              <button
                onClick={() => setTab("total")}
                className={`text-xs md:text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 btn-press ${
                  tab === "total" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
                }`}
              >
                {t.plan.fixedData} ({total.length})
              </button>
            )}
          </div>
          <p className="text-white/50 text-xs mt-3">
            {tab === "daily" ? t.plan.dailyTabHint : t.plan.totalTabHint}
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-6 flex flex-col gap-3">
            <FilterRow label={t.plan.filterData}>
              {dataOptions.map((o) => (
                <Pill
                  key={o.id}
                  active={dataBucket === o.id}
                  onClick={() => setDataBucket(o.id)}
                >
                  {o.label}
                </Pill>
              ))}
              <Pill active={fiveG} onClick={() => setFiveG(!fiveG)}>
                {t.plan.fiveGOnly}
              </Pill>
            </FilterRow>

            {tab === "total" && (
              <FilterRow label={t.plan.filterValidity}>
                {validityOptions.map((o) => (
                  <Pill
                    key={o.id}
                    active={validityBucket === o.id}
                    onClick={() => setValidityBucket(o.id)}
                  >
                    {o.label}
                  </Pill>
                ))}
              </FilterRow>
            )}

            <FilterRow label={t.plan.filterSort}>
              {sortOptions.map((o) => (
                <Pill key={o.id} active={sort === o.id} onClick={() => setSort(o.id)}>
                  {o.label}
                </Pill>
              ))}
            </FilterRow>
          </div>
        </Reveal>

        {/* Compare bar */}
        {comparePlans.length > 0 && (
          <div className="mt-6 bg-neutral-900/90 ring-1 ring-white/15 rounded-2xl p-4 md:p-5 animate-fade-up">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-white text-sm font-medium">
                {t.plan.compareTitle}{" "}
                <span className="text-white/40">
                  ({comparePlans.length}/3)
                </span>
              </p>
              <button
                onClick={() => setCompareIds([])}
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                {t.plan.compareClear}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm min-w-[480px]">
                <thead>
                  <tr className="text-white/40 text-left">
                    <th className="py-2 pr-3 font-normal" />
                    {comparePlans.map((p) => (
                      <th key={p.id} className="py-2 pr-3 font-medium text-white">
                        {formatData(p.gb)}
                        {p.dataType === "Daily Unlimited" ? t.plan.perDay : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-t border-white/5">
                    <td className="py-2.5 pr-3 text-white/40">{t.plan.compareData}</td>
                    {comparePlans.map((p) => (
                      <td key={p.id} className="py-2.5 pr-3">
                        {formatData(p.gb)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2.5 pr-3 text-white/40">{t.plan.compareValidity}</td>
                    {comparePlans.map((p) => (
                      <td key={p.id} className="py-2.5 pr-3">
                        {p.dataType === "Daily Unlimited"
                          ? t.plan.dailyUnlimited
                          : `${p.validityDays} ${t.plan.days}`}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2.5 pr-3 text-white/40">{t.plan.comparePrice}</td>
                    {comparePlans.map((p) => (
                      <td key={p.id} className="py-2.5 pr-3 text-white font-medium">
                        {formatUsd(p.priceUsd)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-2.5 pr-3 text-white/40">{t.plan.compareNetwork}</td>
                    {comparePlans.map((p) => (
                      <td key={p.id} className="py-2.5 pr-3 max-w-[140px]">
                        <span className="line-clamp-2">{p.networks || "—"}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-3 pr-3" />
                    {comparePlans.map((p) => (
                      <td key={p.id} className="py-3 pr-3">
                        <div className="flex flex-col gap-1.5 items-start">
                          <button
                            type="button"
                            onClick={() => addPlanToCart(p)}
                            className="bg-neutral-800 text-white text-xs rounded-full px-3 py-2 hover:bg-neutral-700 transition-colors btn-press"
                          >
                            {addedId === p.id ? t.plan.addedToCart : t.plan.addToCart}
                          </button>
                          <Link
                            href={`/checkout/${p.id}`}
                            className="inline-block bg-white text-black text-xs rounded-full px-4 py-2 hover:bg-neutral-200 transition-colors btn-press"
                          >
                            {t.plan.buy}
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-12 bg-neutral-900/60 rounded-2xl p-8 text-center">
            <p className="text-white/50 text-sm">{t.plan.noPlansMatch}</p>
            <button
              onClick={() => {
                setDataBucket("any");
                setValidityBucket("any");
                setFiveG(false);
              }}
              className="mt-4 text-white underline underline-offset-4 text-sm hover:text-white/70 transition-colors"
            >
              {t.plan.clearFilters}
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-xs mt-8">
              {t.plan.showing} {filtered.length}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setDataBucket("any");
                    setValidityBucket("any");
                    setFiveG(false);
                  }}
                  className="ml-3 text-white/60 hover:text-white underline underline-offset-4 transition-colors"
                >
                  {t.plan.clearFilters}
                </button>
              )}
              {compareIds.length === 0 && (
                <span className="ml-3 text-white/25">· {t.plan.compareHint}</span>
              )}
            </p>
            <StaggerGrid
              resetKey={`${tab}-${dataBucket}-${validityBucket}-${fiveG}-${sort}-${filtered.map((p) => p.id).join("|")}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3 mt-4"
            >
              {filtered.map((p) => {
                const isRec = recommended?.id === p.id;
                const inCompare = compareIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`card-hover bg-neutral-900/80 rounded-2xl p-5 md:p-6 flex flex-col gap-3 h-full ring-1 transition-colors ${
                      inCompare ? "ring-white/40" : isRec ? "ring-white/20" : "ring-white/5"
                    }`}
                    onMouseEnter={() => setStickyPlanId(p.id)}
                    onFocus={() => setStickyPlanId(p.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-white text-2xl font-medium hero-title">
                        {formatData(p.gb)}
                        {p.dataType === "Daily Unlimited" ? (
                          <span className="text-white/50 text-base">{t.plan.perDay}</span>
                        ) : null}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {isRec && (
                          <span className="text-[10px] bg-white text-black rounded-full px-2 py-0.5 font-medium">
                            {t.plan.recommendedBadge}
                          </span>
                        )}
                        {p.speed.includes("5G") && (
                          <span className="text-[10px] bg-white/10 text-white rounded-full px-2 py-0.5 font-medium">
                            5G
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-white/60 text-xs">
                      {p.dataType === "Daily Unlimited"
                        ? t.plan.dailyUnlimited
                        : `${t.plan.validity}: ${p.validityDays} ${t.plan.days}`}
                    </p>

                    {p.networks && (
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                        {p.networks}
                      </p>
                    )}
                    {p.dataType === "Daily Unlimited" && p.fupPolicy && (
                      <p className="text-white/40 text-[11px]">
                        {t.plan.speedAfterFup}: {p.fupPolicy}
                      </p>
                    )}

                    <div className="flex items-end justify-between mt-auto pt-3 gap-3">
                      <div>
                        <p className="text-white text-xl font-medium">
                          {formatUsd(p.priceUsd)}
                          {p.dataType === "Daily Unlimited" && (
                            <span className="text-white/50 text-sm">{t.plan.perDay}</span>
                          )}
                        </p>
                        <p className="text-white/30 text-[10px]">
                          {formatCnyApprox(p.priceUsd)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className={`text-[11px] rounded-full px-3 py-2 transition-colors ${
                            inCompare
                              ? "bg-white/15 text-white"
                              : "bg-neutral-800 text-white/50 hover:text-white"
                          }`}
                        >
                          {inCompare ? t.plan.compareSelected : t.plan.select}
                        </button>
                        <button
                          type="button"
                          onClick={() => addPlanToCart(p)}
                          className="text-[11px] rounded-full px-3 py-2 bg-neutral-800 text-white/70 hover:text-white transition-colors btn-press"
                        >
                          {addedId === p.id ? t.plan.addedToCart : t.plan.addToCart}
                        </button>
                        <Link
                          href={`/checkout/${p.id}`}
                          className="bg-white text-black text-sm rounded-full px-5 py-2 hover:bg-neutral-200 transition-colors btn-press"
                        >
                          {t.plan.buy}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </StaggerGrid>
          </>
        )}

        <Reveal delay={80}>
          <div className="mt-12 text-center">
            <Link
              href="/compatibility"
              className="text-white/50 hover:text-white text-sm underline underline-offset-4 transition-colors"
            >
              {t.plan.checkCompat} →
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Sticky mobile buy bar */}
      {stickyPlan && (
        <div className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-3 safe-area-pb">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {formatData(stickyPlan.gb)}
                {stickyPlan.dataType === "Daily Unlimited" ? t.plan.perDay : ""}
              </p>
              <p className="text-white/50 text-xs">
                {formatUsd(stickyPlan.priceUsd)} · {formatCnyApprox(stickyPlan.priceUsd)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => addPlanToCart(stickyPlan)}
                className="bg-neutral-800 text-white text-sm rounded-full px-4 py-3 hover:bg-neutral-700 transition-colors btn-press ring-1 ring-white/10"
              >
                {addedId === stickyPlan.id ? t.plan.addedToCart : t.plan.addToCart}
              </button>
              <Link
                href={`/checkout/${stickyPlan.id}`}
                className="bg-white text-black text-sm rounded-full px-5 py-3 hover:bg-neutral-200 transition-colors btn-press"
              >
                {t.plan.stickyBuy}
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row">
      <span className="text-white/40 text-xs uppercase tracking-widest w-16 shrink-0 pt-1.5 sm:pt-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 btn-press ${
        active
          ? "bg-white text-black"
          : "bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}
