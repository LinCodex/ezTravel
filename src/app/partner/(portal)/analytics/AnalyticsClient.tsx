"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { RegionFlag } from "@/components/RegionFlag";

const AnalyticsChart = dynamic(() => import("./AnalyticsChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-white/40">
      Loading chart…
    </div>
  ),
});

type Analytics = {
  summary: {
    sold: number;
    spend: number;
    estimatedRetail: number;
    estimatedProfit: number;
    markupPercent: number;
    balanceUsd: number;
    pendingActivation: number;
    active: number;
    expired: number;
    refunded: number;
    assigned: number;
    unassigned: number;
    orderCount: number;
    deliveredOrders: number;
    failedOrders: number;
    avgOrderValue: number;
    avgUnitCost: number;
    marginPercent: number;
    topPlan: string;
    topPlanCount: number;
  };
  byMonth: Array<{ month: string; sold: number; spend: number; estimatedProfit: number }>;
  regions: Array<{ region: string; count: number }>;
  topPlans: Array<{ planName: string; count: number }>;
};

const RANGES = [
  ["1", "Last month"],
  ["3", "Last 3 months"],
  ["12", "Last 12 months"],
  ["0", "All time"],
] as const;

export function AnalyticsClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loadError, setLoadError] = useState("");
  const [range, setRange] = useState("3");
  const [tab, setTab] = useState<"purchases" | "profit" | "volume">("purchases");
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/partner/analytics")
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch(() => setLoadError("Could not load analytics. Refresh to retry."));
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rangeRef.current?.contains(e.target as Node)) setRangeOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    const months = Number(range);
    return months > 0 ? data.byMonth.slice(-months) : data.byMonth;
  }, [data, range]);

  if (loadError) {
    return (
      <div className="pp-card border-red-400/30 px-4 py-3 text-sm text-red-300">{loadError}</div>
    );
  }
  if (!data) {
    return <div className="text-sm text-[var(--pp-muted)]">Loading analytics…</div>;
  }

  const s = data.summary;
  const rangeLabel = RANGES.find(([v]) => v === range)?.[1] || "Last 3 months";

  const primaryStats = [
    { label: "eSIMs sold", value: String(s.sold), hint: "All-time issued" },
    { label: "Wholesale spend", value: `$${s.spend.toFixed(2)}`, hint: "All-time partner cost" },
    { label: "Est. retail", value: `$${s.estimatedRetail.toFixed(2)}`, hint: `At ${s.markupPercent}% markup` },
    { label: "Est. profit", value: `$${s.estimatedProfit.toFixed(2)}`, hint: `${s.marginPercent}% margin` },
  ];

  const secondaryStats = [
    { label: "Balance", value: `$${s.balanceUsd.toFixed(2)}` },
    { label: "Avg order", value: `$${s.avgOrderValue.toFixed(2)}` },
    { label: "Avg unit cost", value: `$${s.avgUnitCost.toFixed(2)}` },
    { label: "Pending activation", value: String(s.pendingActivation) },
    { label: "Active", value: String(s.active) },
    { label: "Expired", value: String(s.expired) },
    { label: "Refunded", value: String(s.refunded) },
    { label: "Assigned", value: `${s.assigned} / ${s.sold}` },
    { label: "Orders", value: String(s.orderCount) },
    { label: "Delivered", value: String(s.deliveredOrders) },
    { label: "Failed", value: String(s.failedOrders) },
    { label: "Top plan", value: s.topPlanCount ? `${s.topPlanCount}×` : "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-white/45">
          All-time sales, inventory health, and estimated profit at your {s.markupPercent}% retail
          markup.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((card) => (
          <div key={card.label} className="pp-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/40">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold">{card.value}</div>
            <div className="mt-1 text-xs text-white/35">{card.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {secondaryStats.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-white/40">{card.label}</div>
            <div className="mt-1 truncate text-lg font-semibold" title={card.value}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="pp-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Activity overview</h2>
              <p className="text-sm text-white/45">Monthly delivered orders.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative" ref={rangeRef}>
                <button
                  type="button"
                  className="pp-btn pp-btn-secondary"
                  onClick={() => setRangeOpen((v) => !v)}
                >
                  {rangeLabel}
                </button>
                {rangeOpen && (
                  <div className="pp-menu right-0 mt-2 w-52">
                    {RANGES.map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        className={`pp-menu-item ${range === v ? "active" : ""}`}
                        onClick={() => {
                          setRange(v);
                          setRangeOpen(false);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {s.topPlan !== "—" && (
                <div className="text-right text-xs text-white/45">
                  Top plan
                  <div className="mt-0.5 max-w-[180px] truncate font-semibold text-white">
                    {s.topPlan}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-4 border-b border-white/10">
            {(
              [
                ["purchases", "Spend"],
                ["profit", "Profit"],
                ["volume", "Volume"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`pp-btn pp-btn-tab border-0 border-b-2 bg-transparent px-1 pb-2 ${
                  tab === id
                    ? "border-emerald-400 text-emerald-300"
                    : "border-transparent text-white/45"
                }`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 h-72">
            <AnalyticsChart data={chartData} mode={tab} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="pp-table-wrap">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Top locations</div>
            <table className="pp-table" style={{ minWidth: 0 }}>
              <tbody>
                {data.regions.map((r) => (
                  <tr key={r.region}>
                    <td>
                      <div className="flex items-center gap-2">
                        <RegionFlag region={r.region} size="sm" />
                        <span className="pp-truncate">{r.region}</span>
                      </div>
                    </td>
                    <td className="w-16 text-right font-semibold text-emerald-300">{r.count}</td>
                  </tr>
                ))}
                {!data.regions.length && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-white/40">
                      No sales data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="pp-table-wrap">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Top packages</div>
            <table className="pp-table" style={{ minWidth: 0 }}>
              <tbody>
                {(data.topPlans || []).map((p) => (
                  <tr key={p.planName}>
                    <td>
                      <div className="pp-truncate" title={p.planName}>
                        {p.planName}
                      </div>
                    </td>
                    <td className="w-16 text-right font-semibold text-emerald-300">{p.count}</td>
                  </tr>
                ))}
                {!data.topPlans?.length && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-white/40">
                      No packages yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
