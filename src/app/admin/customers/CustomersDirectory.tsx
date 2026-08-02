"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readJson } from "@/lib/fetch-json";
import { formatUsd } from "@/lib/utils";

type Customer = {
  email: string;
  wechatId: string | null;
  orderCount: number;
  lifetimeValue: number;
  lastOrderAt: string;
  lastOrderRef: string;
  deliveredCount: number;
};

export function CustomersDirectory() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const p = new URLSearchParams();
    if (debouncedQ) p.set("q", debouncedQ);
    fetch(`/api/admin/customers?${p}`)
      .then((r) => readJson<{ customers?: Customer[]; error?: string }>(r))
      .then(({ ok, data, error: err }) => {
        setCustomers(data?.customers || []);
        if (!ok) setError(err || data?.error || "Failed to load customers");
      })
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Customers</h1>
        <p className="text-xs text-white/50 mt-0.5">Grouped by email across consumer orders</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      )}

      <input
        className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-xs text-white"
        placeholder="Search email or WeChat…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="overflow-x-auto border border-white/10 rounded-2xl bg-neutral-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs text-left border-b border-white/10 bg-white/5">
              <th className="py-3 px-4 font-normal">Customer</th>
              <th className="py-3 px-4 font-normal">Orders</th>
              <th className="py-3 px-4 font-normal">LTV</th>
              <th className="py-3 px-4 font-normal">Last order</th>
              <th className="py-3 px-4 font-normal text-right">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              customers.map((c) => (
                <tr key={c.email}>
                  <td className="py-3 px-4 text-xs">
                    <p className="text-white font-medium">{c.email}</p>
                    {c.wechatId && <p className="text-emerald-400/80">WeChat: {c.wechatId}</p>}
                  </td>
                  <td className="py-3 px-4 text-xs text-white/80">
                    {c.orderCount} ({c.deliveredCount} delivered)
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-400 font-semibold">
                    {formatUsd(c.lifetimeValue)}
                  </td>
                  <td className="py-3 px-4 text-xs text-white/60">
                    <p>{new Date(c.lastOrderAt).toLocaleDateString()}</p>
                    <p className="font-mono text-white/40">{c.lastOrderRef}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders?q=${encodeURIComponent(c.email)}`}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Orders →
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
