"use client";

import { FormEvent, useEffect, useState } from "react";
import { BrandColorPicker } from "@/components/partner/BrandColorPicker";
import { BrandDeliveryPreview } from "@/components/partner/BrandDeliveryPreview";

type PartnerSettings = {
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  contactPhone: string;
  storeZip: string;
  storeState: string;
  retailMarkupPercent: number;
  brandName: string;
  brandAlias: string;
  brandUrl: string;
  brandEmail: string;
  brandLogoUrl: string;
  brandIconUrl: string;
  brandHeroUrl: string;
  brandColor: string;
  supportEmail: string;
  supportPhone: string;
};

const empty: PartnerSettings = {
  companyName: "",
  contactFirstName: "",
  contactLastName: "",
  email: "",
  contactPhone: "",
  storeZip: "",
  storeState: "",
  retailMarkupPercent: 20,
  brandName: "",
  brandAlias: "",
  brandUrl: "",
  brandEmail: "",
  brandLogoUrl: "",
  brandIconUrl: "",
  brandHeroUrl: "",
  brandColor: "#10b981",
  supportEmail: "",
  supportPhone: "",
};

const TABS = ["Company details", "Billing details", "Brand settings"] as const;

export function SettingsClient() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Company details");
  const [form, setForm] = useState<PartnerSettings>(empty);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/partner/settings")
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.partner) setForm({ ...empty, ...d.partner });
      })
      .catch(() => setLoadError("Could not load settings. Refresh to retry."))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof PartnerSettings>(key: K, value: PartnerSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    const res = await fetch("/api/partner/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retailMarkupPercent: Number(form.retailMarkupPercent),
        brandName: form.brandName,
        brandAlias: form.brandAlias,
        brandUrl: form.brandUrl,
        brandEmail: form.brandEmail,
        brandLogoUrl: form.brandLogoUrl,
        brandIconUrl: form.brandIconUrl,
        brandHeroUrl: form.brandHeroUrl,
        brandColor: form.brandColor,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setForm({ ...empty, ...data.partner });
    setMsg("Settings saved.");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <h1 className="text-2xl font-semibold">Company settings</h1>

      <div className="flex flex-wrap gap-4 border-b border-[var(--pp-border)]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`pp-btn pp-btn-tab border-0 border-b-2 bg-transparent px-1 pb-3 text-sm ${
              tab === t
                ? "border-[var(--pp-blue)] text-[var(--pp-blue)]"
                : "border-transparent text-[var(--pp-muted)]"
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="pp-card px-4 py-6 text-sm text-[var(--pp-muted)]">Loading settings…</div>
      )}
      {!loading && loadError && (
        <div className="pp-card border-red-400/30 px-4 py-3 text-sm text-red-300">{loadError}</div>
      )}

      <form onSubmit={save} className={`space-y-5 ${loading ? "hidden" : ""}`}>
        {tab === "Company details" && (
          <section className="pp-card p-6">
            <h2 className="text-base font-semibold">Company details</h2>
            <p className="mt-1 text-sm text-[var(--pp-muted)]">
              Provide your company&apos;s basic information. Changes to identity fields require support.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="pp-label mb-0 sm:col-span-2">
                Company name
                <input className="pp-input mt-1" value={form.companyName} readOnly />
              </label>
              <label className="pp-label mb-0">
                Contact first name
                <input className="pp-input mt-1" value={form.contactFirstName} readOnly />
              </label>
              <label className="pp-label mb-0">
                Contact last name
                <input className="pp-input mt-1" value={form.contactLastName} readOnly />
              </label>
              <label className="pp-label mb-0">
                Contact email
                <input className="pp-input mt-1" value={form.email} readOnly />
              </label>
              <label className="pp-label mb-0">
                Contact phone number
                <input className="pp-input mt-1" value={form.contactPhone || ""} readOnly />
              </label>
              <label className="pp-label mb-0 sm:col-span-2">
                Store ZIP / state
                <input
                  className="pp-input mt-1"
                  value={`${form.storeZip} ${form.storeState}`}
                  readOnly
                />
              </label>
            </div>
            <p className="mt-4 text-xs text-[var(--pp-muted)]">
              To change company identity fields, contact support for a manual update.
            </p>
          </section>
        )}

        {tab === "Billing details" && (
          <section className="pp-card space-y-4 p-6">
            <h2 className="text-base font-semibold">Billing details</h2>
            <p className="text-sm text-[var(--pp-muted)]">
              Retail markup updates suggested retail in the eSIM store without verification.
            </p>
            <label className="pp-label mb-0 max-w-xs">
              Retail markup percentage
              <input
                type="number"
                min={0}
                max={500}
                step={0.1}
                className="pp-input mt-1"
                value={form.retailMarkupPercent}
                onChange={(e) => set("retailMarkupPercent", Number(e.target.value))}
              />
            </label>
          </section>
        )}

        {tab === "Brand settings" && (
          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <section className="pp-card space-y-4 p-6 h-fit">
              <div>
                <h2 className="text-base font-semibold">Brand settings</h2>
                <p className="mt-1 text-sm text-white/45">
                  Used on QuickShare and /p/&#123;alias&#125;/order pages your customers open.
                </p>
              </div>

              {(
                [
                  ["brandName", "Brand name"],
                  ["brandAlias", "Brand alias (URL slug)"],
                  ["brandUrl", "Brand URL"],
                  ["brandEmail", "Brand email"],
                  ["brandLogoUrl", "Brand logo URL"],
                  ["brandIconUrl", "Brand icon URL"],
                  ["brandHeroUrl", "Hero image URL"],
                  ["supportEmail", "Support email"],
                  ["supportPhone", "Support number"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="pp-label mb-0">
                  {label}
                  <input
                    className="pp-input mt-1"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </label>
              ))}

              <BrandColorPicker value={form.brandColor} onChange={(hex) => set("brandColor", hex)} />
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">Customer delivery preview</h2>
                  <p className="text-sm text-white/45">
                    Exact layout customers see — sample QR + iOS / Android LPA install.
                  </p>
                </div>
                <span className="pp-badge pp-badge-green">Live preview</span>
              </div>
              <BrandDeliveryPreview
                brandName={form.brandName}
                brandAlias={form.brandAlias}
                brandColor={form.brandColor}
                brandLogoUrl={form.brandLogoUrl}
                brandHeroUrl={form.brandHeroUrl}
                supportEmail={form.supportEmail || form.brandEmail}
                supportPhone={form.supportPhone}
              />
            </section>
          </div>
        )}

        {(tab === "Billing details" || tab === "Brand settings") && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="pp-btn pp-btn-primary">
              Save settings
            </button>
            {msg && <span className="text-sm text-[var(--pp-success)]">{msg}</span>}
            {error && <span className="text-sm text-[var(--pp-danger)]">{error}</span>}
          </div>
        )}
      </form>
    </div>
  );
}
