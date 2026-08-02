"use client";

import { useEffect, useMemo, useState } from "react";
import { RegionFlag } from "@/components/RegionFlag";
import { usePartnerCart } from "@/components/partner/PartnerCartProvider";
import { CustomSelect } from "@/components/partner/ui/CustomSelect";
import { SearchField } from "@/components/partner/ui/SearchField";
import { addToCart } from "@/lib/partner/cart";

type PlanRow = {
  id: string;
  name: string;
  type: string;
  region: string;
  regionCode?: string;
  dataLabel: string;
  validityDays: number;
  networks: string;
  coverage: string;
  coverageBucket: string;
  price: number;
  suggestedRetail: number;
  speed: string;
  fupPolicy: string;
  gb: number;
};

function networkParts(networks: string) {
  const first = networks.split(/[,;|/]/)[0]?.trim() || "—";
  const speed =
    /\b5G\b/i.test(networks) ? "5G" : /\bLTE\b|\b4G\b/i.test(networks) ? "LTE" : "";
  return { name: first, speed };
}

export function StoreClient() {
  const { refresh, count } = usePartnerCart();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [coverage, setCoverage] = useState("");
  const [minGb, setMinGb] = useState("0");
  const [maxGb, setMaxGb] = useState("100");
  const [minDays, setMinDays] = useState("");
  const [maxDays, setMaxDays] = useState("");
  const [region, setRegion] = useState("");
  const [dataPick, setDataPick] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PlanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [modalRegion, setModalRegion] = useState<string | null>(null);
  const [regionPlans, setRegionPlans] = useState<PlanRow[]>([]);
  const [toast, setToast] = useState("");

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", "20");
    if (debouncedQ) p.set("q", debouncedQ);
    if (coverage) p.set("coverage", coverage);
    if (region) p.set("region", region);
    const min = dataPick === "unlimited" ? 20 : Number(minGb) || 0;
    const max = dataPick && dataPick !== "unlimited" ? Number(dataPick) : Number(maxGb) || 0;
    if (min > 0) p.set("minGb", String(min));
    if (max > 0 && dataPick !== "unlimited") p.set("maxGb", String(max));
    if (minDays) p.set("minDays", minDays);
    if (maxDays) p.set("maxDays", maxDays);
    return p.toString();
  }, [page, debouncedQ, coverage, region, minGb, maxGb, minDays, maxDays, dataPick]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/partner/store?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
        setRecentLocations(data.recentLocations || []);
        setRegions(data.regions || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (!modalRegion) return;
    fetch(`/api/partner/store?region=${encodeURIComponent(modalRegion)}&pageSize=50&page=1`)
      .then((r) => r.json())
      .then((d) => setRegionPlans(d.items || []));
  }, [modalRegion]);

  function add(plan: PlanRow) {
    addToCart({
      planId: plan.id,
      name: plan.name,
      region: plan.region,
      regionCode: plan.regionCode,
      type: plan.type,
      networks: plan.networks,
      dataLabel: plan.dataLabel,
      validityDays: plan.validityDays,
      unitPrice: plan.price,
      suggestedRetail: plan.suggestedRetail,
    });
    refresh();
    setToast(`Added ${plan.name}`);
    setTimeout(() => setToast(""), 1800);
  }

  const pages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="pp-card h-fit space-y-5 p-5">
          <h2 className="text-xl font-semibold">Find a travel plan</h2>
          <div>
            <div className="pp-label">Destination</div>
            <SearchField
              value={q}
              onChange={(v) => {
                setPage(1);
                setQ(v);
              }}
              placeholder="e.g., France, FR"
            />
          </div>

          {recentLocations.length > 0 && (
            <div>
              <div className="pp-label">Recent destinations</div>
              <div className="flex flex-wrap gap-2">
                {recentLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={`pp-chip ${region === loc ? "pp-chip-active" : ""}`}
                    onClick={() => {
                      setRegion(loc);
                      setPage(1);
                    }}
                  >
                    <RegionFlag region={loc} size="sm" />
                    <span className="max-w-[7rem] truncate">{loc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="pp-label">Coverage</div>
            <div className="pp-seg-wrap">
              {[
                ["", "All"],
                ["country", "Country"],
                ["regional", "Regional"],
                ["global", "Global"],
              ].map(([val, label]) => (
                <button
                  key={label}
                  type="button"
                  className={`pp-chip ${coverage === val ? "pp-chip-active" : ""}`}
                  onClick={() => {
                    setCoverage(val);
                    setPage(1);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <CustomSelect
            label="Region"
            value={region}
            onChange={(v) => {
              setRegion(v);
              setPage(1);
            }}
            placeholder="All regions"
            options={[{ value: "", label: "All regions" }, ...regions.map((r) => ({ value: r, label: r }))]}
          />

          <div>
            <div className="pp-label">Data (GB)</div>
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={`pp-chip ${dataPick === "unlimited" ? "pp-chip-active" : ""}`}
                onClick={() => {
                  setDataPick((v) => (v === "unlimited" ? "" : "unlimited"));
                  setPage(1);
                }}
              >
                Unlimited
              </button>
              {["1", "3", "5", "10", "20", "50"].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`pp-chip ${dataPick === n ? "pp-chip-active" : ""}`}
                  onClick={() => {
                    setDataPick((v) => (v === n ? "" : n));
                    setMinGb("0");
                    setMaxGb(n);
                    setPage(1);
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="pp-label mb-0">
                Min (GB)
                <input
                  className="pp-input mt-1"
                  value={minGb}
                  onChange={(e) => {
                    setDataPick("");
                    setMinGb(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label className="pp-label mb-0">
                Max (GB)
                <input
                  className="pp-input mt-1"
                  value={maxGb}
                  onChange={(e) => {
                    setDataPick("");
                    setMaxGb(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CustomSelect
              label="Min validity"
              value={minDays}
              onChange={(v) => {
                setMinDays(v);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any" },
                { value: "7", label: "7+ days" },
                { value: "15", label: "15+ days" },
                { value: "30", label: "30+ days" },
              ]}
            />
            <CustomSelect
              label="Max validity"
              value={maxDays}
              onChange={(v) => {
                setMaxDays(v);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any" },
                { value: "7", label: "≤ 7 days" },
                { value: "15", label: "≤ 15 days" },
                { value: "30", label: "≤ 30 days" },
              ]}
            />
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold">eSIMs store</h1>
              <p className="text-sm text-[var(--pp-muted)]">
                {total} eSIMs available
                {count > 0 ? ` · ${count} in cart` : ""}
              </p>
            </div>
            {toast && <span className="pp-badge pp-badge-green">{toast}</span>}
          </div>

          <div className="pp-card flex items-center justify-between px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">eSIM delivery format</span>
              <span className="pp-badge pp-badge-blue">White-label eSIMs</span>
            </div>
          </div>

          <div className="pp-table-wrap">
            <table className="pp-table">
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Coverage</th>
                  <th>Type</th>
                  <th>Network</th>
                  <th>Package</th>
                  <th>Validity</th>
                  <th>Retail price</th>
                  <th>Price</th>
                  <th>Add</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[var(--pp-muted)]">
                      Loading plans…
                    </td>
                  </tr>
                )}
                {!loading && !items.length && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[var(--pp-muted)]">
                      No plans match your filters.
                    </td>
                  </tr>
                )}
                {items.map((p) => {
                  const net = networkParts(p.networks);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex min-w-0 items-start gap-2.5">
                          <RegionFlag region={p.region} regionCode={p.regionCode} size="sm" className="mt-0.5 shrink-0" />
                          <div className="pp-cell-stack min-w-0">
                            <button
                              type="button"
                              className="pp-cell-title"
                              title={p.region}
                              onClick={() => setModalRegion(p.region)}
                            >
                              {p.region}
                            </button>
                            <div className="pp-cell-sub" title={p.name}>
                              {p.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pp-badge pp-badge-gray" title={p.type}>
                          eSIM
                        </span>
                      </td>
                      <td>
                        <div className="pp-truncate" title={p.networks || net.name}>
                          {net.name}
                          {net.speed && <span className="pp-net-badge">{net.speed}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="pp-truncate font-medium" title={p.dataLabel}>
                          {p.dataLabel}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{p.validityDays} days</td>
                      <td className="whitespace-nowrap">${p.suggestedRetail.toFixed(2)} USD</td>
                      <td className="whitespace-nowrap font-semibold">${p.price.toFixed(2)} USD</td>
                      <td>
                        <button
                          type="button"
                          className="pp-btn pp-btn-icon"
                          aria-label="Add to cart"
                          onClick={() => add(p)}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-[var(--pp-muted)]">
            <span>
              Page {page} / {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="pp-btn pp-btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="pp-btn pp-btn-secondary"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {modalRegion && (
        <div className="pp-modal-backdrop">
          <div className="pp-modal max-w-4xl">
            <div className="flex items-start justify-between gap-3 p-6 pb-3">
              <div>
                <h2 className="text-xl font-semibold">{modalRegion} plans</h2>
                <p className="text-sm text-white/45">All packages for this coverage.</p>
              </div>
              <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setModalRegion(null)}>
                Close
              </button>
            </div>
            <div className="pp-modal-body">
              <div className="pp-table-wrap">
                <table className="pp-table" style={{ minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Data</th>
                      <th>Days</th>
                      <th>Network</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionPlans.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="pp-truncate font-medium" title={p.name}>
                            {p.name}
                          </div>
                        </td>
                        <td>{p.dataLabel}</td>
                        <td>{p.validityDays}</td>
                        <td>
                          <div className="pp-truncate" title={p.networks}>
                            {networkParts(p.networks).name}
                          </div>
                        </td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>
                          <button type="button" className="pp-btn pp-btn-accent" onClick={() => add(p)}>
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
