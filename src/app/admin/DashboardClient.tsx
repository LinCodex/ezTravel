"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatUsd } from "@/lib/utils";

type Dash = {
  revenue: { consumer: number; partner: number; total: number };
  pending: { awaitingConfirmation: number; failedProvisions: number; pendingTopups: number };
  supplierBalance: number;
  mockProvisioning: boolean;
  series: Array<{ day: string; consumer: number; partner: number }>;
};

export function DashboardClient() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="text-white/40 text-sm py-16 text-center">Loading dashboard…</div>;
  }

  const max = Math.max(
    1,
    ...data.series.map((s) => s.consumer + s.partner),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-white/50 mt-0.5">Last 30 days · consumer + partner</p>
        </div>
        <span className="text-xs text-white/40">
          Supplier balance:{" "}
          <strong className="text-emerald-400">{formatUsd(data.supplierBalance)}</strong>
          {data.mockProvisioning ? " (mock)" : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="Total revenue" value={formatUsd(data.revenue.total)} tone="text-emerald-400" />
        <Card label="Consumer" value={formatUsd(data.revenue.consumer)} />
        <Card label="Partner wholesale" value={formatUsd(data.revenue.partner)} />
        <Card
          label="Pending actions"
          value={String(
            data.pending.awaitingConfirmation +
              data.pending.failedProvisions +
              data.pending.pendingTopups,
          )}
          tone="text-yellow-400"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/admin/orders?filter=pending" className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 hover:border-white/20">
          <p className="text-[11px] uppercase text-white/40">Awaiting confirmation</p>
          <p className="text-2xl font-semibold text-yellow-400 mt-1">{data.pending.awaitingConfirmation}</p>
        </Link>
        <Link href="/admin/orders" className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 hover:border-white/20">
          <p className="text-[11px] uppercase text-white/40">Failed provisions</p>
          <p className="text-2xl font-semibold text-red-400 mt-1">{data.pending.failedProvisions}</p>
        </Link>
        <Link href="/admin/topups" className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 hover:border-white/20">
          <p className="text-[11px] uppercase text-white/40">Pending top-ups</p>
          <p className="text-2xl font-semibold text-blue-300 mt-1">{data.pending.pendingTopups}</p>
        </Link>
      </div>

      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5">
        <p className="text-sm font-medium text-white mb-4">Revenue (30 days)</p>
        <div className="flex items-end gap-1 h-40">
          {data.series.map((s) => {
            const total = s.consumer + s.partner;
            const h = Math.round((total / max) * 100);
            const partnerShare = total > 0 ? Math.round((s.partner / total) * 100) : 0;
            return (
              <div key={s.day} className="flex-1 flex flex-col justify-end group relative" title={`${s.day}: ${formatUsd(total)}`}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-emerald-500/80 to-emerald-300/40"
                  style={{ height: `${Math.max(h, total > 0 ? 4 : 0)}%` }}
                >
                  <div
                    className="w-full rounded-t bg-blue-400/50"
                    style={{ height: `${partnerShare}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-white/30 mt-3">Green = consumer · Blue tint = partner</p>
      </div>
    </div>
  );
}

function Card({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
      <span className="text-white/40 text-[11px] uppercase tracking-wider font-medium block">{label}</span>
      <p className={`text-xl sm:text-2xl font-semibold mt-1 sm:mt-2 ${tone}`}>{value}</p>
    </div>
  );
}
