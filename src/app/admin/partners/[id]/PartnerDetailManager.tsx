"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type PartnerDetail = {
  id: string;
  email: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  storeZip: string;
  storeState: string;
  status: string;
  balanceUsd: number;
  retailMarkupPercent: number;
  brandName: string;
  brandAlias: string;
  brandColor: string;
  adminNotes: string;
  createdAt: string;
};

type OrderRow = {
  id: string;
  orderRef: string;
  status: string;
  quantity: number;
  totalUsd: number;
  createdAt: string;
};

type TopupRow = {
  id: string;
  invNumber: string;
  amountUsd: number;
  paymentType: string;
  status: string;
  createdAt: string;
};

type ShareRow = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  target: string;
  url: string;
};

type EsimRow = {
  id: string;
  planName: string;
  region: string;
  status: string;
  iccid: string | null;
  esimTranNo: string | null;
  nickname: string;
  dataRemainingGb: number | null;
  issuedAt: string;
};

const inputCls =
  "mt-1 w-full rounded-full border border-white/10 bg-black px-3 py-2 text-sm text-white";

function badge(status: string) {
  const cls =
    status === "ACTIVE" || status === "DELIVERED" || status === "APPROVED"
      ? "bg-emerald-400/15 text-emerald-300"
      : status === "FAILED" || status === "REJECTED"
        ? "bg-red-400/15 text-red-300"
        : status === "CANCELLED" || status === "SUSPENDED"
          ? "bg-white/10 text-white/50"
          : "bg-yellow-400/15 text-yellow-200";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
}

export function PartnerDetailManager({
  partner,
  esimCount,
  esimActive,
  orders,
  topups,
  esims,
  quickShares,
}: {
  partner: PartnerDetail;
  esimCount: number;
  esimActive: number;
  orders: OrderRow[];
  topups: TopupRow[];
  esims: EsimRow[];
  quickShares: ShareRow[];
}) {
  const router = useRouter();
  const [p, setP] = useState(partner);
  const [edit, setEdit] = useState({
    companyName: partner.companyName,
    contactFirstName: partner.contactFirstName,
    contactLastName: partner.contactLastName,
    contactPhone: partner.contactPhone,
    email: partner.email,
    storeZip: partner.storeZip,
  });
  const [adminNotes, setAdminNotes] = useState(partner.adminNotes || "");
  const [balanceAdjust, setBalanceAdjust] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>, successText: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/partners/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Update failed" });
        return;
      }
      if (data.partner) setP((prev) => ({ ...prev, ...data.partner }));
      setMsg({ ok: true, text: successText });
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Update failed" });
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    await patch(edit, "Profile updated.");
  }

  async function adjustBalance(e: FormEvent) {
    e.preventDefault();
    const amount = Number(balanceAdjust);
    if (!amount || Number.isNaN(amount)) {
      setMsg({ ok: false, text: "Enter a non-zero adjustment amount" });
      return;
    }
    await patch({ balanceAdjust: amount }, `Balance adjusted by $${amount.toFixed(2)}.`);
    setBalanceAdjust("");
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMsg({ ok: false, text: "Password must be at least 8 characters" });
      return;
    }
    await patch({ password: newPassword }, "Password reset.");
    setNewPassword("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{p.companyName}</h1>
          <p className="mt-1 text-sm text-white/50">
            {p.email} · alias <span className="text-white/70">{p.brandAlias}</span> · since{" "}
            {new Date(p.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {badge(p.status)}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              patch(
                { status: p.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
                p.status === "ACTIVE" ? "Partner suspended." : "Partner activated.",
              )
            }
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
          >
            {p.status === "ACTIVE" ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            msg.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/30 bg-red-400/10 text-red-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Balance", `$${p.balanceUsd.toFixed(2)}`],
          ["eSIMs issued", String(esimCount)],
          ["eSIMs active", String(esimActive)],
          ["Retail markup", `${p.retailMarkupPercent}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-neutral-900/50 p-4">
            <div className="text-xs uppercase tracking-wider text-white/40">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <form
          onSubmit={saveProfile}
          className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900/50 p-5"
        >
          <h2 className="text-sm font-semibold">Edit profile</h2>
          {(
            [
              ["companyName", "Company"],
              ["contactFirstName", "First name"],
              ["contactLastName", "Last name"],
              ["contactPhone", "Phone"],
              ["email", "Email"],
              ["storeZip", "Store ZIP"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs text-white/50">
              {label}
              <input
                className={inputCls}
                value={edit[key]}
                onChange={(e) => setEdit((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
          >
            Save profile
          </button>
        </form>

        <div className="space-y-5">
          <form
            onSubmit={adjustBalance}
            className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900/50 p-5"
          >
            <h2 className="text-sm font-semibold">Adjust balance</h2>
            <p className="text-xs text-white/40">
              Positive credits, negative debits. Current: ${p.balanceUsd.toFixed(2)}
            </p>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 100 or -25.50"
              className={inputCls}
              value={balanceAdjust}
              onChange={(e) => setBalanceAdjust(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
            >
              Apply adjustment
            </button>
          </form>

          <form
            onSubmit={resetPassword}
            className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900/50 p-5"
          >
            <h2 className="text-sm font-semibold">Reset password</h2>
            <input
              type="text"
              placeholder="New password (min 8 chars)"
              className={inputCls}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
            >
              Set new password
            </button>
          </form>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-neutral-900/50 p-5">
          <h2 className="text-sm font-semibold">QuickShare links</h2>
          {quickShares.length === 0 && (
            <p className="text-xs text-white/40">No QuickShare links created yet.</p>
          )}
          <ul className="space-y-2">
            {quickShares.map((s) => (
              <li key={s.id} className="rounded-xl border border-white/10 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white/80">{s.target}</span>
                  <span className="text-white/40">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  href={s.url}
                  target="_blank"
                  className="mt-1 block break-all text-emerald-300 hover:underline"
                >
                  {s.url}
                </Link>
                <div className="mt-1 text-white/40">
                  {s.expiresAt
                    ? new Date(s.expiresAt) < new Date()
                      ? "Expired"
                      : `Expires ${new Date(s.expiresAt).toLocaleDateString()}`
                    : "No expiry"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-3">
        <h2 className="text-sm font-semibold">Admin notes</h2>
        <textarea
          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white min-h-[90px]"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Internal CRM notes about this partner…"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => patch({ adminNotes }, "Notes saved.")}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
        >
          Save notes
        </button>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-white/10">
        <div className="border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Partner eSIMs ({esims.length})
        </div>
        <table className="min-w-full text-sm">
          <tbody>
            {esims.map((e) => (
              <tr key={e.id} className="border-t border-white/10 first:border-t-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{e.planName || e.region}</p>
                  <p className="text-xs text-white/40">{e.nickname || e.region}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs break-all">{e.iccid || "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {e.dataRemainingGb != null ? `${e.dataRemainingGb} GB left` : "—"}
                </td>
                <td className="px-4 py-3">{badge(e.status)}</td>
                <td className="px-4 py-3 text-xs space-x-2">
                  <button
                    type="button"
                    className="text-yellow-300"
                    onClick={async () => {
                      await fetch(`/api/admin/esims/${e.id}/lifecycle`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "suspend", source: "partner" }),
                      });
                      router.refresh();
                    }}
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    className="text-emerald-300"
                    onClick={async () => {
                      await fetch(`/api/admin/esims/${e.id}/lifecycle`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "unsuspend", source: "partner" }),
                      });
                      router.refresh();
                    }}
                  >
                    Unsuspend
                  </button>
                </td>
              </tr>
            ))}
            {esims.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-white/40">No eSIMs yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="overflow-x-auto rounded-2xl border border-white/10">
          <div className="border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Wholesale orders
          </div>
          <table className="min-w-full text-sm">
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-white/10 first:border-t-0">
                  <td className="px-4 py-3 font-medium">{o.orderRef}</td>
                  <td className="px-4 py-3">{o.quantity} eSIM</td>
                  <td className="px-4 py-3">${o.totalUsd.toFixed(2)}</td>
                  <td className="px-4 py-3">{badge(o.status)}</td>
                  <td className="px-4 py-3 text-xs text-white/40">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-white/40">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-white/10">
          <div className="border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Recent top-ups
          </div>
          <table className="min-w-full text-sm">
            <tbody>
              {topups.map((t) => (
                <tr key={t.id} className="border-t border-white/10 first:border-t-0">
                  <td className="px-4 py-3 font-medium">{t.invNumber}</td>
                  <td className="px-4 py-3">${t.amountUsd.toFixed(2)}</td>
                  <td className="px-4 py-3">{t.paymentType}</td>
                  <td className="px-4 py-3">{badge(t.status)}</td>
                  <td className="px-4 py-3 text-xs text-white/40">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {topups.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-white/40">No top-ups yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
