"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatData, formatUsd } from "@/lib/utils";

interface AdminPlan {
  id: string;
  name: string;
  region: string;
  dataType: string;
  gb: number;
  validityDays: number;
  costUsd: number;
  priceUsd: number;
  priceOverridden: boolean;
  visible: boolean;
}

export function PricingManager() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/plans?q=${encodeURIComponent(q)}&page=${p}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      setPlans(data.plans);
      setTotal(data.total);
      setPageSize(data.pageSize);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load("", 1);
  }, [load]);

  function onSearch(value: string) {
    setQuery(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(value, 1), 300);
  }

  function goToPage(p: number) {
    setPage(p);
    load(query, p);
  }

  async function patchPlan(
    id: string,
    body: { priceUsd?: number; visible?: boolean; resetPrice?: boolean }
  ) {
    setBusy(id);
    const res = await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (!res.ok) {
      alert("update failed");
      return;
    }
    const updated = await res.json();
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              priceUsd: updated.priceUsd,
              priceOverridden: updated.priceOverridden,
              visible: updated.visible,
            }
          : p
      )
    );
    setEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-white text-2xl font-medium hero-title">pricing</h1>
        <input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="search plan, region or package code..."
          className="w-full md:w-96 bg-neutral-900 rounded-full px-5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      <p className="text-white/40 text-xs mt-4">
        {total} plans · margin formula applies unless a price is overridden (marked ●)
      </p>

      {loading ? (
        <p className="text-white/40 text-sm mt-10">loading...</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs text-left border-b border-white/10">
                <th className="py-3 pr-4 font-normal">plan</th>
                <th className="py-3 pr-4 font-normal">region</th>
                <th className="py-3 pr-4 font-normal">cost</th>
                <th className="py-3 pr-4 font-normal">sell price</th>
                <th className="py-3 pr-4 font-normal">margin</th>
                <th className="py-3 font-normal">visible</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => {
                const editValue = edits[p.id] ?? p.priceUsd.toFixed(2);
                const changed = parseFloat(editValue) !== p.priceUsd;
                const margin = p.priceUsd - p.costUsd;
                return (
                  <tr key={p.id} className={`border-b border-white/5 ${p.visible ? "" : "opacity-40"}`}>
                    <td className="py-2.5 pr-4">
                      <p className="text-white/90">
                        {p.name}
                        {p.priceOverridden && (
                          <span className="text-yellow-400 ml-1.5" title="price overridden">●</span>
                        )}
                      </p>
                      <p className="text-white/30 text-xs">
                        {p.id} · {formatData(p.gb)}
                        {p.dataType === "Daily Unlimited" ? "/day" : ` / ${p.validityDays}d`}
                      </p>
                    </td>
                    <td className="py-2.5 pr-4 text-white/60">{p.region}</td>
                    <td className="py-2.5 pr-4 text-white/60">{formatUsd(p.costUsd)}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">$</span>
                        <input
                          value={editValue}
                          onChange={(e) =>
                            setEdits((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          className="w-20 bg-neutral-900 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
                          inputMode="decimal"
                        />
                        {changed && Number.isFinite(parseFloat(editValue)) && parseFloat(editValue) > 0 && (
                          <button
                            onClick={() => patchPlan(p.id, { priceUsd: parseFloat(editValue) })}
                            disabled={busy === p.id}
                            className="bg-white text-black text-xs rounded-full px-3 py-1 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                          >
                            save
                          </button>
                        )}
                        {p.priceOverridden && !changed && (
                          <button
                            onClick={() => patchPlan(p.id, { resetPrice: true })}
                            disabled={busy === p.id}
                            className="text-white/40 hover:text-white text-xs transition-colors"
                            title="reset to formula price"
                          >
                            reset
                          </button>
                        )}
                      </div>
                    </td>
                    <td className={`py-2.5 pr-4 ${margin <= 0 ? "text-red-400" : "text-white/60"}`}>
                      {formatUsd(margin)}
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => patchPlan(p.id, { visible: !p.visible })}
                        disabled={busy === p.id}
                        className={`text-xs rounded-full px-3 py-1 transition-colors ${
                          p.visible
                            ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                            : "bg-neutral-800 text-white/40 hover:text-white"
                        }`}
                      >
                        {p.visible ? "visible" : "hidden"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="text-white/60 hover:text-white text-sm disabled:opacity-30 transition-colors"
            >
              ← prev
            </button>
            <span className="text-white/40 text-xs">
              page {page} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="text-white/60 hover:text-white text-sm disabled:opacity-30 transition-colors"
            >
              next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
