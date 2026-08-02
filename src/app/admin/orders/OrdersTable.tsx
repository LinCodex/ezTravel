"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatUsd } from "@/lib/utils";

export interface AdminOrder {
  id: string;
  orderRef: string;
  planName: string;
  region: string;
  dataType: string;
  days: number;
  email: string;
  wechatId: string | null;
  paymentMethod: string;
  amountUsd: number;
  status: string;
  failureReason: string | null;
  esimIccid: string | null;
  esimActivation: string | null;
  esimSmdp: string | null;
  supplierOrderNo: string | null;
  esimTranNo: string | null;
  adminNote: string;
  createdAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
}

type Filter =
  | "all"
  | "AWAITING_CONFIRMATION"
  | "AWAITING_PAYMENT"
  | "FAILED"
  | "DELIVERED"
  | "REFUNDED"
  | "PAID";

const STATUS_STYLES: Record<string, string> = {
  AWAITING_CONFIRMATION: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  AWAITING_PAYMENT: "bg-neutral-500/20 text-neutral-300 border border-white/10",
  PAID: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  DELIVERED: "bg-green-500/15 text-green-400 border border-green-500/30",
  FAILED: "bg-red-500/15 text-red-400 border border-red-500/30",
  REFUNDED: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

export function OrdersTable() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedQ, setDebouncedQ] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    revenueUsd: 0,
    deliveredCount: 0,
    pendingCount: 0,
    failedCount: 0,
    awaitingPaymentCount: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrder | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [msg, setMsg] = useState("");
  const pageSize = 25;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (debouncedQ) p.set("q", debouncedQ);
    if (filter !== "all") p.set("status", filter);
    fetch(`/api/admin/orders?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
        setCounts(d.counts || {});
        if (d.stats) setStats(d.stats);
      })
      .finally(() => setLoading(false));
  }, [page, debouncedQ, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(orderId: string, action: string) {
    if (action === "cancel" && !window.confirm("Cancel this order?")) return;
    if (action === "refund" && !window.confirm("Refund this order and cancel the supplier profile?")) return;
    setBusy(`${orderId}:${action}`);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${orderId}/${action}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setMsg(data.error || "Action failed");
      return;
    }
    setMsg(action === "resend" && data.skipped ? "Email logged (no RESEND_API_KEY)" : "Done");
    load();
    if (detail?.id === orderId) {
      const refreshed = await fetch(`/api/admin/orders/${orderId}`).then((r) => r.json());
      if (refreshed.order) {
        const o = refreshed.order;
        setDetail({
          id: o.id,
          orderRef: o.orderRef,
          planName: o.plan?.name || detail.planName,
          region: o.plan?.region || detail.region,
          dataType: o.plan?.dataType || detail.dataType,
          days: o.days,
          email: o.email,
          wechatId: o.wechatId,
          paymentMethod: o.paymentMethod,
          amountUsd: o.amountUsd,
          status: o.status,
          failureReason: o.failureReason,
          esimIccid: o.esimIccid,
          esimActivation: o.esimActivation,
          esimSmdp: o.esimSmdp,
          supplierOrderNo: o.supplierOrderNo,
          esimTranNo: o.esimTranNo,
          adminNote: o.adminNote,
          createdAt: o.createdAt,
          paidAt: o.paidAt,
          deliveredAt: o.deliveredAt,
        });
        setEditEmail(o.email);
      }
    }
  }

  async function saveEmail() {
    if (!detail) return;
    setBusy(`${detail.id}:email`);
    const res = await fetch(`/api/admin/orders/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: editEmail }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error || "Save failed");
      return;
    }
    setDetail({ ...detail, email: editEmail.trim().toLowerCase() });
    setMsg("Email updated");
    load();
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const chips: Array<{ key: Filter; label: string; count?: number }> = [
    { key: "all", label: "All", count: Object.values(counts).reduce((a, b) => a + b, 0) },
    { key: "AWAITING_CONFIRMATION", label: "Pending", count: counts.AWAITING_CONFIRMATION || 0 },
    { key: "AWAITING_PAYMENT", label: "Awaiting pay", count: counts.AWAITING_PAYMENT || 0 },
    { key: "FAILED", label: "Failed", count: counts.FAILED || 0 },
    { key: "DELIVERED", label: "Delivered", count: counts.DELIVERED || 0 },
    { key: "REFUNDED", label: "Refunded", count: counts.REFUNDED || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-medium block">Revenue</span>
          <p className="text-xl sm:text-2xl font-semibold text-emerald-400 mt-1 sm:mt-2">
            {formatUsd(stats.revenueUsd)}
          </p>
        </div>
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-medium block">Needs Action</span>
          <p className="text-xl sm:text-2xl font-semibold text-yellow-400 mt-1 sm:mt-2">{stats.pendingCount}</p>
        </div>
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-medium block">Failed</span>
          <p className="text-xl sm:text-2xl font-semibold text-red-400 mt-1 sm:mt-2">{stats.failedCount}</p>
        </div>
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-5">
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-medium block">Customers</span>
          <p className="text-xl sm:text-2xl font-semibold text-blue-400 mt-1 sm:mt-2">{stats.customers}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-semibold hero-title">Customer Orders</h1>
          <p className="text-white/50 text-xs mt-0.5">Paginated CRM with eSIM detail and lifecycle actions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, ref, ICCID, WeChat…"
            className="flex-1 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
          />
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-full border border-white/10 overflow-x-auto">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setFilter(c.key);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  filter === c.key ? "bg-white text-black font-medium" : "text-neutral-300 hover:text-white"
                }`}
              >
                {c.label} ({c.count ?? 0})
              </button>
            ))}
          </div>
        </div>
        {msg && <p className="text-xs text-emerald-300">{msg}</p>}
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-10 text-center">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-neutral-900/40 rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-white/40 text-sm">No matching orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-2xl bg-neutral-900/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs text-left border-b border-white/10 bg-white/5">
                <th className="py-3.5 px-4 font-normal">Order</th>
                <th className="py-3.5 px-4 font-normal">Plan</th>
                <th className="py-3.5 px-4 font-normal">Customer</th>
                <th className="py-3.5 px-4 font-normal">Amount</th>
                <th className="py-3.5 px-4 font-normal">Status</th>
                <th className="py-3.5 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      className="text-emerald-400 hover:underline font-mono text-xs font-medium"
                      onClick={() => {
                        setDetail(o);
                        setEditEmail(o.email);
                        setMsg("");
                      }}
                    >
                      {o.orderRef}
                    </button>
                    <p className="text-white/30 text-[11px] mt-0.5">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-white/80">
                    <p className="font-medium text-white">{o.planName}</p>
                    <p className="text-white/40">{o.region}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <p className="text-white/90">{o.email}</p>
                    {o.wechatId && <p className="text-emerald-400/80">WeChat: {o.wechatId}</p>}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-white font-semibold">
                    {formatUsd(o.amountUsd)}
                    <p className="text-white/40 font-normal uppercase">{o.paymentMethod}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                        STATUS_STYLES[o.status] ?? "bg-neutral-700 text-white"
                      }`}
                    >
                      {o.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {(o.status === "AWAITING_CONFIRMATION" || o.status === "AWAITING_PAYMENT") && (
                      <button
                        type="button"
                        disabled={busy?.startsWith(o.id)}
                        onClick={() => act(o.id, "confirm")}
                        className="bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold rounded-full px-3 py-1.5"
                      >
                        Confirm
                      </button>
                    )}
                    {o.status === "FAILED" && (
                      <button
                        type="button"
                        disabled={busy?.startsWith(o.id)}
                        onClick={() => act(o.id, "retry")}
                        className="bg-yellow-400 text-black text-xs font-semibold rounded-full px-3 py-1.5"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-white/40 hover:text-white text-xs"
                      onClick={() => {
                        setDetail(o);
                        setEditEmail(o.email);
                      }}
                    >
                      Detail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-white/40">
        <span>
          Page {page}/{pages} · {total} orders
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-full border border-white/10 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-full border border-white/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{detail.orderRef}</h2>
                <p className="text-xs text-white/40">{detail.planName}</p>
              </div>
              <button
                type="button"
                className="text-white/50 text-sm"
                onClick={() => setDetail(null)}
              >
                Close
              </button>
            </div>

            <span
              className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${
                STATUS_STYLES[detail.status] ?? "bg-neutral-700 text-white"
              }`}
            >
              {detail.status}
            </span>
            {detail.failureReason && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {detail.failureReason}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-white/40">Amount</dt>
                <dd className="text-white font-semibold">{formatUsd(detail.amountUsd)}</dd>
              </div>
              <div>
                <dt className="text-white/40">Payment</dt>
                <dd className="text-white uppercase">{detail.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-white/40">ICCID</dt>
                <dd className="text-white font-mono break-all">{detail.esimIccid || "—"}</dd>
              </div>
              <div>
                <dt className="text-white/40">esimTranNo</dt>
                <dd className="text-white font-mono break-all">{detail.esimTranNo || "—"}</dd>
              </div>
              <div>
                <dt className="text-white/40">Supplier order</dt>
                <dd className="text-white font-mono break-all">{detail.supplierOrderNo || "—"}</dd>
              </div>
              <div>
                <dt className="text-white/40">SM-DP+</dt>
                <dd className="text-white font-mono break-all">{detail.esimSmdp || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-white/40">LPA activation</dt>
                <dd className="text-emerald-300 font-mono break-all text-[11px]">
                  {detail.esimActivation || "—"}
                </dd>
              </div>
            </dl>

            {detail.esimActivation && (
              <div className="rounded-xl border border-white/10 bg-white p-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="eSIM QR"
                  className="h-40 w-40"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(detail.esimActivation)}`}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-white/40">Customer email</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-full px-3 py-2 text-xs text-white"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-full bg-white text-black text-xs font-semibold"
                  disabled={busy === `${detail.id}:email`}
                  onClick={saveEmail}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              {(detail.status === "AWAITING_CONFIRMATION" || detail.status === "AWAITING_PAYMENT") && (
                <button
                  type="button"
                  className="bg-emerald-400 text-black text-xs font-semibold rounded-full px-3 py-1.5"
                  disabled={!!busy}
                  onClick={() => act(detail.id, "confirm")}
                >
                  Confirm & provision
                </button>
              )}
              {(detail.status === "FAILED" || detail.status === "PAID" || detail.status === "DELIVERED") && (
                <button
                  type="button"
                  className="bg-yellow-400 text-black text-xs font-semibold rounded-full px-3 py-1.5"
                  disabled={!!busy}
                  onClick={() => act(detail.id, "retry")}
                >
                  {detail.status === "FAILED" ? "Retry provision" : "Re-provision"}
                </button>
              )}
              {detail.status === "DELIVERED" && (
                <button
                  type="button"
                  className="border border-white/20 text-white text-xs rounded-full px-3 py-1.5"
                  disabled={!!busy}
                  onClick={() => act(detail.id, "resend")}
                >
                  Resend email
                </button>
              )}
              {!["REFUNDED", "CANCELLED"].includes(detail.status) && (
                <button
                  type="button"
                  className="text-red-300 border border-red-500/30 text-xs rounded-full px-3 py-1.5"
                  disabled={!!busy}
                  onClick={() => act(detail.id, "refund")}
                >
                  Refund
                </button>
              )}
              {(detail.status === "AWAITING_CONFIRMATION" || detail.status === "AWAITING_PAYMENT") && (
                <button
                  type="button"
                  className="text-red-400 text-xs px-3 py-1.5"
                  disabled={!!busy}
                  onClick={() => act(detail.id, "cancel")}
                >
                  Cancel
                </button>
              )}
              <Link
                href={`/order/${detail.orderRef}`}
                target="_blank"
                className="text-white/40 hover:text-white text-xs px-3 py-1.5"
              >
                Open delivery ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
