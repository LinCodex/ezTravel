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
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    region: string;
    priceUsd: number;
    visible: boolean;
  }>({ name: "", region: "", priceUsd: 0, visible: true });

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
    body: { name?: string; region?: string; priceUsd?: number; visible?: boolean; resetPrice?: boolean }
  ) {
    setBusy(id);
    const res = await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (!res.ok) {
      alert("Update failed");
      return;
    }
    const updated = await res.json();
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: updated.name ?? p.name,
              region: updated.region ?? p.region,
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
    setEditingPlan(null);
  }

  function openEditModal(plan: AdminPlan) {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      region: plan.region,
      priceUsd: plan.priceUsd,
      visible: plan.visible,
    });
  }

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-semibold hero-title">Plan Pricing & Details</h1>
          <p className="text-white/40 text-xs mt-1">
            Configure sell prices, plan names, region mappings, and visibility status
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search plan name, region or ID..."
          className="w-full md:w-96 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{total} total plans in database · ● indicates custom overridden price</span>
      </div>

      {loading ? (
        <div className="bg-neutral-900/40 rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-white/40 text-sm">Loading plans...</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {plans.map((p) => {
              const editValue = edits[p.id] ?? p.priceUsd.toFixed(2);
              const changed = parseFloat(editValue) !== p.priceUsd;
              const margin = p.priceUsd - p.costUsd;

              return (
                <div
                  key={p.id}
                  className={`bg-neutral-900/80 border border-white/10 rounded-2xl p-4 space-y-3 ${
                    p.visible ? "" : "opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-white text-sm font-semibold flex items-center gap-1.5">
                        {p.name}
                        {p.priceOverridden && <span className="text-yellow-400 text-xs">●</span>}
                      </h3>
                      <p className="text-white/40 text-[11px] mt-0.5">
                        {p.id} · {p.region}
                      </p>
                    </div>
                    <button
                      onClick={() => patchPlan(p.id, { visible: !p.visible })}
                      disabled={busy === p.id}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                        p.visible
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-neutral-800 text-white/40 border-white/10"
                      }`}
                    >
                      {p.visible ? "Visible" : "Hidden"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/40 block">Cost Price</span>
                      <span className="text-white/80 font-medium">{formatUsd(p.costUsd)}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Est. Margin</span>
                      <span className={margin <= 0 ? "text-red-400 font-medium" : "text-emerald-400 font-medium"}>
                        {formatUsd(margin)}
                      </span>
                    </div>
                  </div>

                  {/* Inline Price Edit for Mobile */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40 text-xs">$</span>
                      <input
                        value={editValue}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="w-20 bg-neutral-950 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-white/30"
                        inputMode="decimal"
                      />
                      {changed && Number.isFinite(parseFloat(editValue)) && parseFloat(editValue) > 0 && (
                        <button
                          onClick={() => patchPlan(p.id, { priceUsd: parseFloat(editValue) })}
                          disabled={busy === p.id}
                          className="bg-emerald-400 text-black text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        >
                          Save
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => openEditModal(p)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-full transition-colors"
                    >
                      Edit All
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto border border-white/10 rounded-2xl bg-neutral-900/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs text-left border-b border-white/10 bg-white/5">
                  <th className="py-3.5 px-4 font-normal">Plan Name & Code</th>
                  <th className="py-3.5 px-4 font-normal">Region</th>
                  <th className="py-3.5 px-4 font-normal">Cost USD</th>
                  <th className="py-3.5 px-4 font-normal">Sell Price USD</th>
                  <th className="py-3.5 px-4 font-normal">Margin</th>
                  <th className="py-3.5 px-4 font-normal">Visibility</th>
                  <th className="py-3.5 px-4 font-normal text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {plans.map((p) => {
                  const editValue = edits[p.id] ?? p.priceUsd.toFixed(2);
                  const changed = parseFloat(editValue) !== p.priceUsd;
                  const margin = p.priceUsd - p.costUsd;
                  return (
                    <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors ${p.visible ? "" : "opacity-45"}`}>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-xs">
                          {p.name}
                          {p.priceOverridden && (
                            <span className="text-yellow-400 ml-1.5" title="Price overridden">●</span>
                          )}
                        </p>
                        <p className="text-white/30 text-[11px] mt-0.5">
                          {p.id} · {formatData(p.gb)}
                          {p.dataType === "Daily Unlimited" ? "/day" : ` / ${p.validityDays}d`}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-xs font-medium">{p.region}</td>
                      <td className="py-3 px-4 text-white/50 text-xs">{formatUsd(p.costUsd)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs">$</span>
                          <input
                            value={editValue}
                            onChange={(e) =>
                              setEdits((prev) => ({ ...prev, [p.id]: e.target.value }))
                            }
                            className="w-20 bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-white/30"
                            inputMode="decimal"
                          />
                          {changed && Number.isFinite(parseFloat(editValue)) && parseFloat(editValue) > 0 && (
                            <button
                              onClick={() => patchPlan(p.id, { priceUsd: parseFloat(editValue) })}
                              disabled={busy === p.id}
                              className="bg-emerald-400 text-black text-xs font-semibold rounded-full px-3 py-1 hover:bg-emerald-300 transition-colors disabled:opacity-50"
                            >
                              Save
                            </button>
                          )}
                          {p.priceOverridden && !changed && (
                            <button
                              onClick={() => patchPlan(p.id, { resetPrice: true })}
                              disabled={busy === p.id}
                              className="text-white/40 hover:text-white text-xs transition-colors"
                              title="Reset to margin formula price"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 font-medium text-xs ${margin <= 0 ? "text-red-400" : "text-emerald-400/80"}`}>
                        {formatUsd(margin)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => patchPlan(p.id, { visible: !p.visible })}
                          disabled={busy === p.id}
                          className={`text-xs font-medium rounded-full px-3 py-1 transition-colors ${
                            p.visible
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-neutral-800 text-white/40 border border-white/10"
                          }`}
                        >
                          {p.visible ? "Visible" : "Hidden"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(p)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs px-3 py-1 rounded-full transition-colors"
                        >
                          Edit Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border border-white/10 rounded-2xl bg-neutral-900/40">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="text-white/60 hover:text-white text-xs disabled:opacity-30 transition-colors px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
            >
              ← Prev
            </button>
            <span className="text-white/40 text-xs font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="text-white/60 hover:text-white text-xs disabled:opacity-30 transition-colors px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Plan Details Configuration Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Configure Plan Details</h3>
                <p className="text-white/40 text-xs font-mono mt-0.5">{editingPlan.id}</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-white/40 hover:text-white text-lg p-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1">Plan Display Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1">Region Category</label>
                <input
                  type="text"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1">Sell Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.priceUsd}
                  onChange={(e) => setEditForm({ ...editForm, priceUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-white/70 text-xs font-medium">Visible to Customers</span>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, visible: !editForm.visible })}
                  className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors ${
                    editForm.visible
                      ? "bg-emerald-400 text-black"
                      : "bg-neutral-800 text-white/40"
                  }`}
                >
                  {editForm.visible ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-white/60 hover:text-white text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  patchPlan(editingPlan.id, {
                    name: editForm.name,
                    region: editForm.region,
                    priceUsd: editForm.priceUsd,
                    visible: editForm.visible,
                  })
                }
                disabled={busy === editingPlan.id}
                className="bg-white text-black text-xs font-semibold rounded-full px-5 py-2.5 hover:bg-neutral-200 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
