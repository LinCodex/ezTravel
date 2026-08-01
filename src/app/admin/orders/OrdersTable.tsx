"use client";

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

type Filter = "pending" | "all";

const STATUS_STYLES: Record<string, string> = {
  AWAITING_CONFIRMATION: "bg-yellow-500/15 text-yellow-400",
  AWAITING_PAYMENT: "bg-neutral-500/20 text-neutral-300",
  DELIVERED: "bg-green-500/15 text-green-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  // Computed on the client only to avoid a hydration mismatch with Date.now().
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "AWAITING_CONFIRMATION").length,
    [orders]
  );

  const visible = orders.filter((o) =>
    filter === "pending"
      ? o.status === "AWAITING_CONFIRMATION" || o.status === "AWAITING_PAYMENT"
      : true
  );

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-medium hero-title">orders</h1>
        <div className="flex items-center gap-1 bg-neutral-900 rounded-full px-1.5 py-1.5">
          <button
            onClick={() => setFilter("pending")}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              filter === "pending"
                ? "bg-white text-black"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            needs action ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              filter === "all" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
            }`}
          >
            all ({orders.length})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-white/40 text-sm mt-10">no orders here.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs text-left border-b border-white/10">
                <th className="py-3 pr-4 font-normal">ref</th>
                <th className="py-3 pr-4 font-normal">plan</th>
                <th className="py-3 pr-4 font-normal">customer</th>
                <th className="py-3 pr-4 font-normal">payment</th>
                <th className="py-3 pr-4 font-normal">amount</th>
                <th className="py-3 pr-4 font-normal">status</th>
                <th className="py-3 pr-4 font-normal">waiting</th>
                <th className="py-3 font-normal">actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const waiting =
                  now === null
                    ? null
                    : Math.floor((now - new Date(o.createdAt).getTime()) / 60000);
                const isPending = o.status === "AWAITING_CONFIRMATION";
                return (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white font-mono text-xs">{o.orderRef}</td>
                    <td className="py-3 pr-4 text-white/80">
                      {o.planName}
                      {o.dataType === "Daily Unlimited" ? ` × ${o.days}d` : ""}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-white/80">{o.email}</p>
                      {o.wechatId && (
                        <p className="text-white/40 text-xs">wechat: {o.wechatId}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-white/80">{o.paymentMethod}</td>
                    <td className="py-3 pr-4 text-white">{formatUsd(o.amountUsd)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap ${
                          STATUS_STYLES[o.status] ?? "bg-neutral-700 text-white"
                        }`}
                      >
                        {o.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {isPending && waiting !== null ? (
                        <span
                          className={
                            waiting >= 60 ? "text-red-400" : waiting >= 40 ? "text-yellow-400" : "text-white/60"
                          }
                        >
                          {waiting}m
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {(isPending || o.status === "AWAITING_PAYMENT") && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => act(o.id, "confirm")}
                            disabled={busy === o.id}
                            className="bg-white text-black text-xs rounded-full px-4 py-1.5 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                          >
                            {busy === o.id ? "..." : "confirm payment"}
                          </button>
                          <button
                            onClick={() => act(o.id, "cancel")}
                            disabled={busy === o.id}
                            className="text-red-400/80 hover:text-red-400 text-xs transition-colors"
                          >
                            cancel
                          </button>
                        </div>
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
