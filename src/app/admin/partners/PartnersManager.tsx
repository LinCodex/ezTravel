"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type PartnerRow = {
  id: string;
  email: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  storeZip: string;
  storeState: string;
  status: string;
  balanceUsd: number;
  brandAlias: string;
  createdAt: string;
};

export function PartnersManager({ initial }: { initial: PartnerRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    contactFirstName: "",
    contactLastName: "",
    storeZip: "",
    openingBalance: "0",
  });

  async function createPartner(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        openingBalance: Number(form.openingBalance) || 0,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to create");
      return;
    }
    setForm({
      email: "",
      password: "",
      companyName: "",
      contactFirstName: "",
      contactLastName: "",
      storeZip: "",
      openingBalance: "0",
    });
    router.refresh();
    const list = await fetch("/api/admin/partners").then((r) => r.json());
    setRows(list.partners || []);
  }

  async function toggleStatus(p: PartnerRow) {
    const status = p.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await fetch(`/api/admin/partners/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRows((prev) => prev.map((r) => (r.id === p.id ? { ...r, status } : r)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Partners</h1>
        <p className="mt-1 text-sm text-white/50">Manually register partner portal accounts.</p>
      </div>

      <form
        onSubmit={createPartner}
        className="grid gap-3 rounded-2xl border border-white/10 bg-neutral-900/50 p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {(
          [
            ["email", "Email", "email"],
            ["password", "Temp password", "text"],
            ["companyName", "Company", "text"],
            ["contactFirstName", "First name", "text"],
            ["contactLastName", "Last name", "text"],
            ["storeZip", "Store ZIP", "text"],
            ["openingBalance", "Opening balance", "number"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block text-xs text-white/50">
            {label}
            <input
              type={type}
              required={key !== "openingBalance" && key !== "contactFirstName" && key !== "contactLastName"}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-1 w-full rounded-full border border-white/10 bg-black px-3 py-2 text-sm text-white"
            />
          </label>
        ))}
        <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
          >
            Create partner
          </button>
          {error && <span className="text-sm text-red-300">{error}</span>}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">ZIP</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Alias</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <Link href={`/admin/partners/${p.id}`} className="font-medium hover:underline">
                    {p.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white/70">{p.email}</td>
                <td className="px-4 py-3">
                  {p.storeZip} {p.storeState}
                </td>
                <td className="px-4 py-3">${p.balanceUsd.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-yellow-400/15 text-yellow-200"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/60">{p.brandAlias}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/partners/${p.id}`}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/5"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => toggleStatus(p)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/5"
                    >
                      {p.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
