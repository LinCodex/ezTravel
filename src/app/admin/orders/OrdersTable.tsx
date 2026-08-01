"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  createdAt: string;
  deliveredAt: string | null;
}

type Filter = "pending" | "all" | "delivered" | "awaiting_payment";

const STATUS_STYLES: Record<string, string> = {
  AWAITING_CONFIRMATION: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  AWAITING_PAYMENT: "bg-neutral-500/20 text-neutral-300 border border-white/10",
  DELIVERED: "bg-green-500/15 text-green-400 border border-green-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => (o.status === "DELIVERED" ? acc + o.amountUsd : acc), 0);
    const pendingCount = orders.filter((o) => o.status === "AWAITING_CONFIRMATION").length;
    const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
    const uniqueEmails = new Set(orders.map((o) => o.email.toLowerCase())).size;

    return { totalRev, pendingCount, deliveredCount, uniqueEmails };
  }, [orders]);

  const visible = useMemo(() => {
    return orders.filter((o) => {
      // Filter tab
      if (filter === "pending" && o.status !== "AWAITING_CONFIRMATION") return false;
      if (filter === "delivered" && o.status !== "DELIVERED") return false;
      if (filter === "awaiting_payment" && o.status !== "AWAITING_PAYMENT") return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesRef = o.orderRef.toLowerCase().includes(q);
        const matchesEmail = o.email.toLowerCase().includes(q);
        const matchesWechat = o.wechatId?.toLowerCase().includes(q) ?? false;
        const matchesPlan = o.planName.toLowerCase().includes(q) || o.region.toLowerCase().includes(q);
        return matchesRef || matchesEmail || matchesWechat || matchesPlan;
      }

      return true;
    });
  }, [orders, filter, search]);

  async function act(orderId: string, action: "confirm" | "cancel") {
    if (action === "cancel" && !window.confirm("Cancel this order?")) return;
    setBusy(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}/${action}`, {
      method: "POST",
    });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert("action failed");
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* CRM Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5">
          <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Delivered Revenue</span>
          <p className="text-2xl font-semibold text-emerald-400 mt-2">{formatUsd(stats.totalRev)}</p>
        </div>
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5">
          <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Needs Action</span>
          <p className="text-2xl font-semibold text-yellow-400 mt-2">{stats.pendingCount}</p>
        </div>
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5">
          <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Delivered eSIMs</span>
          <p className="text-2xl font-semibold text-white mt-2">{stats.deliveredCount}</p>
        </div>
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5">
          <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Total Customers</span>
          <p className="text-2xl font-semibold text-blue-400 mt-2">{stats.uniqueEmails}</p>
        </div>
      </div>

      {/* Header & CRM Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-medium hero-title">Customer Orders & CRM</h1>
          <p className="text-white/50 text-xs mt-1">Manage orders, confirm payments, and access customer records</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, ref, WeChat..."
              className="w-full bg-neutral-900 rounded-full px-4 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30 border border-white/10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filter === "all" ? "bg-white text-black font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filter === "pending" ? "bg-yellow-400 text-black font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              Needs Action ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filter === "delivered" ? "bg-emerald-400 text-black font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              Delivered ({stats.deliveredCount})
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-neutral-900/40 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-white/40 text-sm">No matching orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-2xl bg-neutral-900/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs text-left border-b border-white/10 bg-white/5">
                <th className="py-3.5 px-4 font-normal">Order Ref</th>
                <th className="py-3.5 px-4 font-normal">Plan Details</th>
                <th className="py-3.5 px-4 font-normal">Customer CRM Info</th>
                <th className="py-3.5 px-4 font-normal">Payment</th>
                <th className="py-3.5 px-4 font-normal">Amount</th>
                <th className="py-3.5 px-4 font-normal">Status</th>
                <th className="py-3.5 px-4 font-normal">Wait Time</th>
                <th className="py-3.5 px-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((o) => {
                const waiting =
                  now === null
                    ? null
                    : Math.floor((now - new Date(o.createdAt).getTime()) / 60000);
                const isPending = o.status === "AWAITING_CONFIRMATION";
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/order/${o.orderRef}`}
                        target="_blank"
                        className="text-emerald-400 hover:underline font-mono text-xs font-medium"
                      >
                        {o.orderRef} ↗
                      </Link>
                      <p className="text-white/30 text-[11px] mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
                      <p className="font-medium text-white text-xs">{o.planName}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {o.region} · {o.dataType === "Daily Unlimited" ? `${o.days} Days` : "Fixed Data"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/90 text-xs font-medium">{o.email}</span>
                        <button
                          onClick={() => copyText(o.email, o.id + "-email")}
                          className="text-white/30 hover:text-white text-[10px] px-1 bg-white/5 rounded"
                          title="Copy Email"
                        >
                          {copied === o.id + "-email" ? "✓" : "copy"}
                        </button>
                      </div>
                      {o.wechatId && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-emerald-400/80 text-xs">WeChat: {o.wechatId}</span>
                          <button
                            onClick={() => copyText(o.wechatId!, o.id + "-wechat")}
                            className="text-white/30 hover:text-white text-[10px] px-1 bg-white/5 rounded"
                            title="Copy WeChat ID"
                          >
                            {copied === o.id + "-wechat" ? "✓" : "copy"}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-white/70 text-xs uppercase font-medium">
                      {o.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-white font-semibold text-xs">
                      {formatUsd(o.amountUsd)}
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
                    <td className="py-3.5 px-4 text-xs">
                      {isPending && waiting !== null ? (
                        <span
                          className={`font-semibold ${
                            waiting >= 60 ? "text-red-400" : waiting >= 40 ? "text-yellow-400" : "text-white/60"
                          }`}
                        >
                          {waiting}m
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(isPending || o.status === "AWAITING_PAYMENT") && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => act(o.id, "confirm")}
                            disabled={busy === o.id}
                            className="bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold rounded-full px-3.5 py-1.5 transition-colors disabled:opacity-50"
                          >
                            {busy === o.id ? "..." : "Confirm & Send"}
                          </button>
                          <button
                            onClick={() => act(o.id, "cancel")}
                            disabled={busy === o.id}
                            className="text-red-400 hover:text-red-300 text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {o.status === "DELIVERED" && (
                        <Link
                          href={`/order/${o.orderRef}`}
                          target="_blank"
                          className="text-white/40 hover:text-white text-xs transition-colors"
                        >
                          View eSIM →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
