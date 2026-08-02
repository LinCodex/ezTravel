"use client";

import { useMemo, useState } from "react";
import {
  getPartnerPaymentInstructions,
  type PartnerPayMethod,
} from "@/lib/partner/payment-instructions";

type Topup = {
  id: string;
  invNumber: string;
  amountUsd: number;
  paymentType: string;
  status: string;
  adminNote: string;
  createdAt: string;
  partner: { companyName: string; email: string; brandAlias: string };
};

const STATUS_FILTERS = ["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;

function statusLabel(s: string) {
  return s === "" ? "All" : s.charAt(0) + s.slice(1).toLowerCase();
}

function ageLabel(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function payDestination(method: string): string {
  const known = ["ZELLE", "VENMO", "WECHAT", "CASH"];
  if (!known.includes(method)) return "";
  const info = getPartnerPaymentInstructions(method as PartnerPayMethod);
  return info.lines[0] || "";
}

function statusBadgeClass(status: string) {
  if (status === "APPROVED") return "bg-emerald-400/15 text-emerald-300";
  if (status === "REJECTED") return "bg-red-400/15 text-red-300";
  if (status === "CANCELLED") return "bg-white/10 text-white/50";
  return "bg-yellow-400/15 text-yellow-200";
}

export function TopupsManager({ initial }: { initial: Topup[] }) {
  const [rows, setRows] = useState(initial);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState("");

  const pendingCount = rows.filter((r) => r.status === "PENDING").length;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows
      .filter((r) => !statusFilter || r.status === statusFilter)
      .filter(
        (r) =>
          !query ||
          r.invNumber.toLowerCase().includes(query) ||
          r.partner.companyName.toLowerCase().includes(query) ||
          r.partner.email.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        // Pending requests always float to the top, oldest first
        const aPending = a.status === "PENDING" ? 0 : 1;
        const bPending = b.status === "PENDING" ? 0 : 1;
        if (aPending !== bPending) return aPending - bPending;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [rows, statusFilter, q]);

  async function review(id: string, action: "APPROVE" | "REJECT") {
    setError("");
    setReviewingId(id);
    try {
      const res = await fetch(`/api/admin/topups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: notes[id] || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Could not ${action.toLowerCase()} request`);
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data.topup, partner: r.partner } : r)),
      );
    } catch {
      setError(`Could not ${action.toLowerCase()} request`);
    } finally {
      setReviewingId("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Balance top-ups</h1>
          <p className="mt-1 text-sm text-white/50">
            Verify Zelle / Venmo / WeChat / Cash payments, then approve to credit partner balance.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-200">
            {pendingCount} pending review
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-white text-black"
                : "border border-white/15 text-white/60 hover:text-white"
            }`}
          >
            {statusLabel(s)}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search INV, partner, email"
          className="ml-auto w-64 max-w-full rounded-full border border-white/10 bg-black px-4 py-1.5 text-sm placeholder:text-white/30"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">INV</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-white/10 align-top">
                <td className="px-4 py-3 font-medium">{t.invNumber}</td>
                <td className="px-4 py-3">
                  <div>{t.partner.companyName}</div>
                  <div className="text-xs text-white/40">{t.partner.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold">${t.amountUsd.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div>{t.paymentType}</div>
                  {t.status === "PENDING" && payDestination(t.paymentType) && (
                    <div className="mt-0.5 max-w-[200px] text-xs text-white/40">
                      Expect at: {payDestination(t.paymentType)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>{new Date(t.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-white/40">{ageLabel(t.createdAt)}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="min-w-[220px] space-y-2 px-4 py-3">
                  {t.status === "PENDING" ? (
                    <>
                      <input
                        value={notes[t.id] || ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [t.id]: e.target.value }))}
                        placeholder="Admin note"
                        className="w-full rounded-full border border-white/10 bg-black px-3 py-1.5 text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => review(t.id, "APPROVE")}
                          disabled={reviewingId === t.id}
                          className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black disabled:opacity-50"
                        >
                          {reviewingId === t.id ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => review(t.id, "REJECT")}
                          disabled={reviewingId === t.id}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-white/40">{t.adminNote || "—"}</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  {rows.length === 0
                    ? "No top-up requests yet."
                    : "No requests match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
