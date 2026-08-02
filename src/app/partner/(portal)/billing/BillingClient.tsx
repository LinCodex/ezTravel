"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CustomDateField } from "@/components/partner/ui/CustomDateField";
import { CustomSelect } from "@/components/partner/ui/CustomSelect";
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
  createdAt: string;
};

export function BillingClient() {
  const [balance, setBalance] = useState(0);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [amount, setAmount] = useState("100");
  const [paymentType, setPaymentType] = useState<PartnerPayMethod>("ZELLE");
  const [status, setStatus] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastInv, setLastInv] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const instructions = useMemo(
    () => getPartnerPaymentInstructions(paymentType),
    [paymentType],
  );

  function load() {
    setLoading(true);
    setLoadError("");
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (typeFilter) p.set("paymentType", typeFilter);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    fetch(`/api/partner/billing?${p}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        setBalance(d.partner?.balanceUsd || 0);
        setTopups(d.topups || []);
      })
      .catch(() => setLoadError("Could not load billing history. Please retry."))
      .finally(() => setLoading(false));
  }

  async function cancelTopup(id: string, invNumber: string) {
    if (!confirm(`Cancel top-up request ${invNumber}?`)) return;
    setCancellingId(id);
    setMsg(null);
    const res = await fetch(`/api/partner/billing/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL" }),
    });
    const data = await res.json().catch(() => ({}));
    setCancellingId("");
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || "Could not cancel request" });
      return;
    }
    setMsg({ ok: true, text: `Request ${invNumber} cancelled.` });
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, typeFilter, from, to]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/partner/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsd: Number(amount), paymentType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || "Could not create top-up request" });
      return;
    }
    setLastInv(data.topup.invNumber);
    setMsg({
      ok: true,
      text: `Request ${data.topup.invNumber} created. Send payment using the instructions below, then wait for master verification.`,
    });
    load();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="mt-1 text-sm text-[var(--pp-muted)]">
            Prepaid balance tops up after master portal verifies your payment.
          </p>
        </div>
        <a href="/api/partner/billing/export" className="pp-btn pp-btn-secondary">
          Export all PDF
        </a>
      </div>

      <div className="pp-card p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--pp-muted)]">
          Current balance
        </div>
        <div className="mt-2 text-4xl font-semibold">${balance.toFixed(2)} USD</div>
      </div>

      <form onSubmit={submit} className="pp-card space-y-5 p-5">
        <div>
          <h2 className="text-sm font-semibold">Request a top-up</h2>
          <p className="mt-1 text-xs text-white/40">
            1) Create a request · 2) Send payment to the destination shown · 3) Master verifies & credits
          </p>
        </div>

        <div className="pp-field-row">
          <div className="pp-field">
            <div className="pp-field-label">Amount (USD)</div>
            <div className="pp-field-control">
              <input
                className="pp-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="pp-field">
            <div className="pp-field-label">Payment type</div>
            <div className="pp-field-control">
              <CustomSelect
                value={paymentType}
                onChange={(v) => setPaymentType(v as PartnerPayMethod)}
                options={[
                  { value: "ZELLE", label: "Zelle" },
                  { value: "VENMO", label: "Venmo" },
                  { value: "WECHAT", label: "WeChat" },
                  { value: "CASH", label: "Cash" },
                ]}
              />
            </div>
          </div>
          <div className="pp-field">
            <div className="pp-field-label">&nbsp;</div>
            <div className="pp-field-control">
              <button type="submit" className="pp-btn pp-btn-primary whitespace-nowrap px-6">
                Request top-up
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
          <div className="text-sm font-semibold text-emerald-300">{instructions.title}</div>
          <ul className="mt-2 space-y-1.5 text-sm text-white/80">
            {instructions.lines.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-emerald-400">→</span>
                <span>{line}</span>
              </li>
            ))}
            {lastInv && (
              <li className="flex gap-2">
                <span className="text-emerald-400">→</span>
                <span>
                  Use memo / note: <strong className="text-white">{lastInv}</strong>
                </span>
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs text-white/45">{instructions.note}</p>
        </div>

        {msg && (
          <p className={`text-sm ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>{msg.text}</p>
        )}
      </form>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Top-up history</h2>
          <p className="text-xs text-white/40">
            PENDING = waiting for master verification. You can cancel pending requests anytime.
          </p>
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CustomSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
          <CustomSelect
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "", label: "All types" },
              { value: "ZELLE", label: "Zelle" },
              { value: "VENMO", label: "Venmo" },
              { value: "WECHAT", label: "WeChat" },
              { value: "CASH", label: "Cash" },
            ]}
          />
          <CustomDateField label="From" value={from} onChange={setFrom} />
          <CustomDateField label="To" value={to} onChange={setTo} />
        </div>
      </section>

      {loadError && (
        <div className="pp-card flex items-center justify-between gap-3 border-red-400/30 px-4 py-3 text-sm text-red-300">
          <span>{loadError}</span>
          <button type="button" className="pp-btn pp-btn-secondary px-3 py-1 text-xs" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div className="pp-table-wrap">
        <table className="pp-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>INV</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[var(--pp-muted)]">
                  Loading history…
                </td>
              </tr>
            )}
            {!loading &&
              topups.map((t) => (
              <tr key={t.id}>
                <td className="font-medium">{t.invNumber}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>${t.amountUsd.toFixed(2)} USD</td>
                <td>
                  <span
                    className={`pp-badge ${
                      t.status === "APPROVED"
                        ? "pp-badge-green"
                        : t.status === "REJECTED" || t.status === "CANCELLED"
                          ? "pp-badge-orange"
                          : "pp-badge-gray"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td>{t.paymentType}</td>
                <td>
                  <div className="flex flex-wrap items-center gap-1">
                    <a
                      href={`/api/partner/billing/export?inv=${encodeURIComponent(t.invNumber)}`}
                      className="pp-btn pp-btn-ghost px-2 py-1 text-[var(--pp-blue)]"
                    >
                      PDF
                    </a>
                    {t.status === "PENDING" && (
                      <button
                        type="button"
                        className="pp-btn pp-btn-ghost px-2 py-1 text-red-300"
                        disabled={cancellingId === t.id}
                        onClick={() => cancelTopup(t.id, t.invNumber)}
                      >
                        {cancellingId === t.id ? "…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !loadError && !topups.length && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[var(--pp-muted)]">
                  No top-up history for these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
