"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { StaggerGrid } from "@/components/StaggerGrid";
import { SupportWidget } from "@/components/SupportWidget";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { RegionFlag } from "@/components/RegionFlag";
import {
  FEATURED_DESTINATIONS,
  formatCnyApprox,
  getCardGradient,
  getContinent,
  type Continent,
} from "@/lib/destinations-meta";
import { formatUsd } from "@/lib/utils";

export interface RegionSummary {
  region: string;
  regionSlug: string;
  type: string;
  minPrice: number;
  planCount: number;
  regionCode?: string;
}

type Tab = "all" | "local" | "regional" | "global";
type ContinentFilter = "all" | Continent | "china-trip";

function regionCategory(r: RegionSummary): Exclude<Tab, "all"> {
  if (r.region.startsWith("Global")) return "global";
  return r.type === "Single" ? "local" : "regional";
}

function categoryBadge(
  r: RegionSummary,
  t: ReturnType<typeof useLanguage>["t"]
): string {
  const cat = regionCategory(r);
  if (cat === "global") return t.browse.badgeGlobal;
  if (cat === "regional") return t.browse.badgeRegional;
  return t.browse.badgeLocal;
}

export function DestinationsBrowser({
  regions,
  initialQuery = "",
  initialTab = "all",
}: {
  regions: RegionSummary[];
  initialQuery?: string;
  initialTab?: Tab;
}) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [continent, setContinent] = useState<ContinentFilter>("all");

  const featured = useMemo(() => {
    return FEATURED_DESTINATIONS.map((name) =>
      regions.find((r) => r.region === name)
    ).filter(Boolean) as RegionSummary[];
  }, [regions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regions.filter((r) => {
      if (tab !== "all" && regionCategory(r) !== tab) return false;
      const cont = getContinent(r.region, r.type);
      if (continent === "china-trip") {
        if (!/china|hong kong|macao/i.test(r.region)) return false;
      } else if (continent !== "all" && cont !== continent) {
        return false;
      }
      if (!q) return true;
      const zhName = regionDisplayName(r.region, "zh");
      const raw = query.trim();
      return (
        r.region.toLowerCase().includes(q) ||
        zhName.includes(raw) ||
        zhName.toLowerCase().includes(q) ||
        r.regionSlug.includes(q.replace(/\s+/g, "-"))
      );
    });
  }, [regions, query, tab, continent]);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "all", label: t.browse.tabAll },
    { id: "local", label: t.browse.tabLocal },
    { id: "regional", label: t.browse.tabRegional },
    { id: "global", label: t.browse.tabGlobal },
  ];

  const continents: Array<{ id: ContinentFilter; label: string }> = [
    { id: "all", label: t.browse.continentAll },
    { id: "china-trip", label: t.browse.tripChina },
    { id: "china", label: t.browse.continentChina },
    { id: "asia", label: t.browse.continentAsia },
    { id: "europe", label: t.browse.continentEurope },
    { id: "americas", label: t.browse.continentAmericas },
    { id: "oceania", label: t.browse.continentOceania },
    { id: "middleeast", label: t.browse.continentMiddleEast },
    { id: "africa", label: t.browse.continentAfrica },
    { id: "global", label: t.browse.continentGlobal },
  ];

  const suggestions = [
    { label: locale === "zh" ? "中国大陆" : "China mainland", slug: "china-mainland" },
    { label: locale === "zh" ? "日本" : "Japan", slug: "japan" },
    {
      label: locale === "zh" ? "欧洲 (40+地区)" : "Europe (40+ areas)",
      slug: "europe-40-areas",
    },
    {
      label: locale === "zh" ? "美国和加拿大" : "USA & Canada",
      slug: "usa-and-canada",
    },
  ];

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h1 className="hero-title text-5xl md:text-7xl font-medium">
            {t.browse.title}
          </h1>
          <p className="text-white/70 mt-3 text-sm md:text-base">{t.browse.subtitle}</p>
        </Reveal>

        {featured.length > 0 && (
          <Reveal delay={80}>
            <div className="mt-10">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-white text-lg md:text-xl font-medium">
                    {t.browse.featuredTitle}
                  </h2>
                  <p className="text-white/40 text-xs mt-1">{t.browse.featuredSubtitle}</p>
                </div>
              </div>
              <div className="h-scroll flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory">
                {featured.map((r) => (
                  <Link
                    key={r.regionSlug}
                    href={`/destinations/${r.regionSlug}`}
                    className={`card-hover snap-start shrink-0 w-[200px] md:w-[220px] rounded-2xl p-4 bg-gradient-to-br ${getCardGradient(r.region, r.type)} ring-1 ring-white/10`}
                  >
                    <RegionFlag region={r.region} regionCode={r.regionCode} size="lg" />
                    <p className="text-white text-sm font-medium mt-3 leading-tight line-clamp-2">
                      {regionDisplayName(r.region, locale)}
                    </p>
                    <p className="text-white/50 text-xs mt-2">
                      {t.browse.from} {formatUsd(r.minPrice)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.browse.searchPlaceholder}
              className="w-full md:max-w-md bg-neutral-900 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/40 transition-shadow"
            />
            <div className="flex items-center gap-1 bg-neutral-900 rounded-full px-1.5 py-1.5 self-start overflow-x-auto max-w-full">
              {tabs.map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`text-xs md:text-sm px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 btn-press ${
                    tab === tb.id
                      ? "bg-white text-black"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {continents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContinent(c.id)}
                  className={`text-[11px] md:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 btn-press ${
                    continent === c.id
                      ? "bg-white/15 text-white ring-1 ring-white/30"
                      : "bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            {filtered.length} {t.browse.resultsCount}
          </p>
          <Link
            href="/compatibility"
            className="text-white/60 hover:text-white text-xs underline underline-offset-4 transition-colors"
          >
            {t.browse.checkCompat} →
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 bg-neutral-900/60 rounded-2xl p-8 text-center">
            <p className="text-white/70 text-sm">{t.browse.noResults}</p>
            <p className="text-white/40 text-xs mt-2">{t.browse.emptyHint}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {suggestions.map((s) => (
                <Link
                  key={s.slug}
                  href={`/destinations/${s.slug}`}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-full px-4 py-2 transition-colors"
                >
                  {s.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setQuery("");
                  setTab("all");
                  setContinent("all");
                }}
                className="text-white/50 hover:text-white text-xs underline underline-offset-4 px-2"
              >
                {t.plan.clearFilters}
              </button>
            </div>
          </div>
        ) : (
          <StaggerGrid
            key={`${tab}-${continent}-${query}`}
            resetKey={filtered.map((r) => r.regionSlug).join("|")}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3 mt-4"
          >
            {filtered.map((r) => (
              <Link
                key={r.regionSlug}
                href={`/destinations/${r.regionSlug}`}
                className={`card-hover group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 h-full min-h-[140px] bg-gradient-to-br ${getCardGradient(r.region, r.type)} ring-1 ring-white/10`}
              >
                <div className="flex items-start justify-between gap-3">
                  <RegionFlag region={r.region} regionCode={r.regionCode} size="lg" />
                  <span className="text-[10px] uppercase tracking-wider text-white/50 bg-black/30 rounded-full px-2.5 py-1">
                    {categoryBadge(r, t)}
                  </span>
                </div>
                <div className="mt-auto">
                  <p className="text-white text-sm md:text-base font-medium leading-tight">
                    {regionDisplayName(r.region, locale)}
                  </p>
                  <div className="flex items-end justify-between gap-3 mt-2">
                    <p className="text-white/50 text-xs">
                      {r.planCount} {t.browse.plans}
                    </p>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">
                        {t.browse.from} {formatUsd(r.minPrice)}
                      </p>
                      <p className="text-white/30 text-[10px]">
                        {formatCnyApprox(r.minPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </StaggerGrid>
        )}

        <Reveal delay={100}>
          <div className="mt-14">
            <SupportWidget />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
