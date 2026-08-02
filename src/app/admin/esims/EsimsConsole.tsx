"use client";

import { useCallback, useEffect, useState } from "react";
import { readJson } from "@/lib/fetch-json";

type Row = {
  id: string;
  source: "consumer" | "partner";
  label: string;
  region: string;
  email: string;
  partnerName: string | null;
  status: string;
  iccid: string | null;
  esimTranNo: string | null;
  dataRemainingGb: number | null;
  usedGb?: number | null;
  totalGb?: number | null;
  createdAt: string;
};

export function EsimsConsole() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pageSize = 25;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize), source });
    if (debouncedQ) p.set("q", debouncedQ);
    fetch(`/api/admin/esims?${p}`)
      .then((r) => readJson<{ items?: Row[]; total?: number; error?: string }>(r))
      .then(({ ok, data, error: err }) => {
        setItems(data?.items || []);
        setTotal(data?.total || 0);
        if (!ok) setError(err || data?.error || "Failed to load eSIMs");
      })
      .catch(() => setError("Failed to load eSIMs"))
      .finally(() => setLoading(false));
  }, [page, source, debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  async function lifecycle(row: Row, action: "suspend" | "unsuspend" | "revoke") {
    if (action === "revoke" && !window.confirm("Permanently revoke this eSIM?")) return;
    setBusy(`${row.id}:${action}`);
    const res = await fetch(`/api/admin/esims/${row.id}/lifecycle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, source: row.source }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Action failed");
      return;
    }
    load();
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white">eSIM Console</h1>
        <p className="text-xs text-white/50 mt-0.5">Consumer + partner profiles with lifecycle actions</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 min-w-[220px] bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white"
          placeholder="Search ICCID, email, partner, region…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {(["all", "consumer", "partner"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSource(s);
              setPage(1);
            }}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              source === s ? "bg-white text-black border-white" : "border-white/10 text-white/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-white/10 rounded-2xl bg-neutral-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs text-left border-b border-white/10 bg-white/5">
              <th className="py-3 px-4 font-normal">Profile</th>
              <th className="py-3 px-4 font-normal">Owner</th>
              <th className="py-3 px-4 font-normal">ICCID</th>
              <th className="py-3 px-4 font-normal">Usage</th>
              <th className="py-3 px-4 font-normal">Status</th>
              <th className="py-3 px-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && !items.length && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/40">
                  No eSIMs found.
                </td>
              </tr>
            )}
            {items.map((r) => (
              <tr key={`${r.source}-${r.id}`} className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-xs">
                  <p className="text-white font-medium">{r.label}</p>
                  <p className="text-white/40">
                    {r.region} · {r.source}
                  </p>
                </td>
                <td className="py-3 px-4 text-xs">
                  <p className="text-white/90">{r.email}</p>
                  {r.partnerName && <p className="text-emerald-400/80">{r.partnerName}</p>}
                </td>
                <td className="py-3 px-4 text-[11px] font-mono text-white/70 break-all max-w-[160px]">
                  {r.iccid || "—"}
                </td>
                <td className="py-3 px-4 text-xs text-white/80">
                  {r.dataRemainingGb != null
                    ? `${r.dataRemainingGb} GB left${r.totalGb != null ? ` / ${r.totalGb}` : ""}`
                    : "—"}
                </td>
                <td className="py-3 px-4 text-xs text-white/70">{r.status}</td>
                <td className="py-3 px-4 text-right space-x-2 text-xs">
                  <button
                    type="button"
                    disabled={!!busy}
                    className="text-yellow-300"
                    onClick={() => lifecycle(r, "suspend")}
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    className="text-emerald-300"
                    onClick={() => lifecycle(r, "unsuspend")}
                  >
                    Unsuspend
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    className="text-red-300"
                    onClick={() => lifecycle(r, "revoke")}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between text-xs text-white/40">
        <span>
          Page {page}/{pages} · {total}
        </span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
