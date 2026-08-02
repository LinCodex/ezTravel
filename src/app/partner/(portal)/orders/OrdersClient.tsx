"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CustomDateField } from "@/components/partner/ui/CustomDateField";
import { CustomSelect } from "@/components/partner/ui/CustomSelect";
import { SearchField } from "@/components/partner/ui/SearchField";
import { matchesSearch } from "@/lib/partner/search";

type Order = {
  id: string;
  orderRef: string;
  quantity: number;
  status: string;
  date: string;
  orderedBy: string;
  orderTotal: number;
  packageType: string;
  deliveryPath: string;
};

function statusBadge(status: string) {
  if (status === "DELIVERED") return <span className="pp-badge pp-badge-green">Completed</span>;
  if (status === "FAILED" || status === "CANCELLED")
    return <span className="pp-badge pp-badge-orange">{status}</span>;
  return <span className="pp-badge pp-badge-gray">{status}</span>;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function OrdersClient() {
  const search = useSearchParams();
  const highlight = search.get("highlight") || "";
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [packageType, setPackageType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [sharingRef, setSharingRef] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!filterRef.current?.contains(e.target as Node)) setFiltersOpen(false);
      if (!dateRef.current?.contains(e.target as Node)) setDateOpen(false);
      if (!actionsRef.current?.contains(e.target as Node)) setActionsOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function load() {
    setLoading(true);
    setLoadError("");
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (packageType) p.set("packageType", packageType);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    fetch(`/api/partner/orders?${p}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => setOrders(d.orders || []))
      .catch(() => setLoadError("Could not load orders. Please retry."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = q
    ? orders.filter(
        (o) =>
          matchesSearch(o.orderRef, q) ||
          matchesSearch(o.orderedBy, q) ||
          matchesSearch(o.packageType, q) ||
          matchesSearch(o.status, q),
      )
    : orders;

  async function share(orderRef: string) {
    setSharingRef(orderRef);
    setShareError("");
    setShareUrl("");
    setShareCopied(false);
    try {
      const res = await fetch("/api/partner/quickshare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setShareError(data.error || "Could not create QuickShare link");
        return;
      }
      setShareUrl(data.url);
      setShareCopied(await copyToClipboard(data.url));
    } catch {
      setShareError("Could not create QuickShare link");
    } finally {
      setSharingRef("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="Search by Order ID"
        />

        <div className="relative" ref={dateRef}>
          <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setDateOpen((v) => !v)}>
            Date
          </button>
          {dateOpen && (
            <div className="pp-menu left-0 mt-2 w-72 space-y-3 p-3">
              <CustomDateField label="From" value={from} onChange={setFrom} />
              <CustomDateField label="To" value={to} onChange={setTo} />
              <button
                type="button"
                className="pp-btn pp-btn-primary w-full"
                onClick={() => {
                  setDateOpen(false);
                  load();
                }}
              >
                Apply dates
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={filterRef}>
          <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setFiltersOpen((v) => !v)}>
            Filters
          </button>
          {filtersOpen && (
            <div className="pp-menu left-0 mt-2 w-72 space-y-3 p-3">
              <CustomSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "", label: "All statuses" },
                  { value: "DELIVERED", label: "Delivered" },
                  { value: "PROCESSING", label: "Processing" },
                  { value: "FAILED", label: "Failed" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
              />
              <CustomSelect
                label="Package"
                value={packageType}
                onChange={setPackageType}
                options={[
                  { value: "", label: "All packages" },
                  { value: "ESIM", label: "eSIMs purchase" },
                  { value: "TOPUP", label: "Top-ups" },
                ]}
              />
              <button
                type="button"
                className="pp-btn pp-btn-primary w-full"
                onClick={() => {
                  setFiltersOpen(false);
                  load();
                }}
              >
                Apply filters
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm text-[var(--pp-muted)]">
          <span>{filtered.length} results</span>
          <div className="relative" ref={actionsRef}>
            <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setActionsOpen((v) => !v)}>
              Actions ▾
            </button>
            {actionsOpen && (
              <div className="pp-menu right-0 mt-2 w-48">
                <a href="/api/partner/orders/export" className="pp-menu-item">
                  Export Excel
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {shareUrl && (
        <div className="pp-card flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
          <span className="text-[var(--pp-muted)]">QuickShare (expires in 30 days):</span>
          <span className="break-all text-[var(--pp-blue)]">{shareUrl}</span>
          <button
            type="button"
            className="pp-btn pp-btn-secondary px-3 py-1 text-xs"
            onClick={async () => setShareCopied(await copyToClipboard(shareUrl))}
          >
            {shareCopied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      )}
      {shareError && (
        <div className="pp-card border-red-400/30 px-4 py-3 text-sm text-red-300">{shareError}</div>
      )}
      {loadError && (
        <div className="pp-card flex items-center justify-between gap-3 border-red-400/30 px-4 py-3 text-sm text-red-300">
          <span>{loadError}</span>
          <button type="button" className="pp-btn pp-btn-secondary px-3 py-1 text-xs" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div className="pp-table-wrap">
        <table className="pp-table" style={{ minWidth: 860 }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Ordered by</th>
              <th>Order total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[var(--pp-muted)]">
                  Loading orders…
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((o) => (
                <tr key={o.id} className={highlight === o.orderRef ? "bg-emerald-400/10" : undefined}>
                  <td>
                    <Link href={o.deliveryPath} className="pp-link underline" target="_blank">
                      {o.orderRef}
                    </Link>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1">▣ {o.quantity}</span>
                  </td>
                  <td>{statusBadge(o.status)}</td>
                  <td className="whitespace-nowrap">
                    {new Date(o.date).toISOString().slice(0, 16).replace("T", " ").replace(/-/g, "/")}
                  </td>
                  <td>{o.orderedBy}</td>
                  <td className="whitespace-nowrap font-semibold">${o.orderTotal.toFixed(2)} USD</td>
                  <td className="space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="pp-btn pp-btn-ghost px-2 py-1 text-[var(--pp-blue)]"
                      disabled={sharingRef === o.orderRef}
                      onClick={() => share(o.orderRef)}
                    >
                      {sharingRef === o.orderRef ? "Sharing…" : "Share"}
                    </button>
                    <a
                      href={`/api/partner/orders/export?orderRef=${encodeURIComponent(o.orderRef)}`}
                      className="pp-btn pp-btn-ghost px-2 py-1"
                    >
                      Excel
                    </a>
                  </td>
                </tr>
              ))}
            {!loading && !loadError && !filtered.length && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[var(--pp-muted)]">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
