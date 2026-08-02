"use client";

import { useEffect, useRef, useState } from "react";
import { RegionFlag } from "@/components/RegionFlag";
import { CustomSelect } from "@/components/partner/ui/CustomSelect";
import { SearchField } from "@/components/partner/ui/SearchField";

type Esim = {
  id: string;
  planId: string;
  planName: string;
  region: string;
  regionCode: string;
  dataLabel: string;
  validityDays: number;
  status: string;
  iccid: string | null;
  assignee: string;
  nickname: string;
  networks: string;
  notes: string;
  unitPaidUsd: number;
  dataRemainingGb: number | null;
  refunded: boolean;
  archived: boolean;
  issuedAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  activationCode: string | null;
  smdpAddress: string | null;
};

function statusBadge(e: Esim) {
  if (e.refunded || e.status === "REFUNDED") return <span className="pp-badge pp-badge-blue">Refunded</span>;
  if (e.status === "EXPIRED") return <span className="pp-badge pp-badge-gray">Expired</span>;
  if (e.status === "PENDING_ACTIVATION") return <span className="pp-badge pp-badge-orange">Pending</span>;
  if (e.status === "SUSPENDED") return <span className="pp-badge pp-badge-orange">Suspended</span>;
  if (e.status === "ACTIVE") return <span className="pp-badge pp-badge-green">Active</span>;
  return <span className="pp-badge pp-badge-gray">{e.status}</span>;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function usageLabel(e: Esim) {
  if (e.dataRemainingGb != null) return `${e.dataRemainingGb} GB left`;
  return e.dataLabel || "—";
}

export function EsimsClient() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [refunded, setRefunded] = useState(false);
  const [pendingActivation, setPendingActivation] = useState(false);
  const [dataRemaining, setDataRemaining] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [items, setItems] = useState<Esim[]>([]);
  const [detail, setDetail] = useState<Esim | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [usageText, setUsageText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!filterRef.current?.contains(e.target as Node)) setFiltersOpen(false);
      if (!actionsRef.current?.contains(e.target as Node)) setActionsOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  function load() {
    setLoading(true);
    setLoadError("");
    const p = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (debouncedQ) p.set("q", debouncedQ);
    if (status) p.set("status", status);
    if (expiresInDays) p.set("expiresInDays", expiresInDays);
    if (refunded) p.set("refunded", "1");
    if (pendingActivation) p.set("pendingActivation", "1");
    if (dataRemaining) p.set("dataRemaining", dataRemaining);
    if (showArchived) p.set("archived", "1");
    fetch(`/api/partner/esims?${p}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || 0);
        setArchivedCount(d.archivedCount || 0);
      })
      .catch(() => setLoadError("Could not load eSIMs. Please retry."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status, expiresInDays, refunded, pendingActivation, dataRemaining, debouncedQ, showArchived]);

  async function copyShare(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
  }

  async function createShare(esimId: string) {
    setSharing(true);
    setShareError("");
    setShareUrl("");
    setShareCopied(false);
    try {
      const res = await fetch("/api/partner/quickshare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ esimId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setShareError(data.error || "Could not create QuickShare link");
        return;
      }
      setShareUrl(data.url);
      await copyShare(data.url);
    } catch {
      setShareError("Could not create QuickShare link");
    } finally {
      setSharing(false);
    }
  }

  async function saveNotes() {
    if (!detail) return;
    setSaveMsg(null);
    const res = await fetch("/api/partner/esims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: detail.id,
        nickname: detail.nickname,
        assignee: detail.assignee,
        notes: detail.notes,
      }),
    });
    if (res.ok) {
      setSaveMsg({ ok: true, text: "Saved" });
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setSaveMsg({ ok: false, text: data.error || "Save failed" });
    }
  }

  async function setArchived(esim: Esim, archived: boolean) {
    setBusyId(esim.id);
    try {
      const res = await fetch("/api/partner/esims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: esim.id, archived }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not update archive");
        return;
      }
      if (detail?.id === esim.id) setDetail(null);
      load();
    } finally {
      setBusyId(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{showArchived ? "Archived eSIMs" : "eSIMs"}</h1>
          <p className="text-sm text-[var(--pp-muted)]">
            {showArchived
              ? "Hidden from your active list — restore anytime"
              : "Your inventory of purchased eSIM profiles"}
          </p>
        </div>
        <button
          type="button"
          className={`pp-btn ${showArchived ? "pp-btn-primary" : "pp-btn-secondary"}`}
          onClick={() => {
            setShowArchived((v) => !v);
            setPage(1);
          }}
        >
          {showArchived ? "← Active eSIMs" : `Archive (${archivedCount})`}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          className="min-w-[240px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="Search plan, region, nickname, ICCID…"
        />

        <div className="relative" ref={filterRef}>
          <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setFiltersOpen((v) => !v)}>
            Filters
          </button>
          {filtersOpen && (
            <div className="pp-menu left-0 mt-2 w-72 space-y-3 p-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold">Filters</span>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost px-2 py-1 text-[var(--pp-blue)]"
                  onClick={() => {
                    setStatus("");
                    setExpiresInDays("");
                    setRefunded(false);
                    setPendingActivation(false);
                    setDataRemaining("");
                  }}
                >
                  Clear all
                </button>
              </div>
              <CustomSelect
                label="Package status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "", label: "All statuses" },
                  { value: "PENDING_ACTIVATION", label: "Pending activation" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "EXPIRED", label: "Expired" },
                  { value: "REFUNDED", label: "Refunded" },
                  { value: "SUSPENDED", label: "Suspended" },
                ]}
              />
              <CustomSelect
                label="Expires in"
                value={expiresInDays}
                onChange={setExpiresInDays}
                options={[
                  { value: "", label: "Any" },
                  { value: "7", label: "< 7 days" },
                  { value: "14", label: "< 14 days" },
                  { value: "30", label: "< 30 days" },
                ]}
              />
              <CustomSelect
                label="Data allowance"
                value={dataRemaining}
                onChange={setDataRemaining}
                options={[
                  { value: "", label: "Any" },
                  { value: "low", label: "Small (≤ 1 GB left)" },
                ]}
              />
              <label className="flex items-center gap-2 px-1 text-sm">
                <input type="checkbox" checked={refunded} onChange={(e) => setRefunded(e.target.checked)} />
                Refunded
              </label>
              <label className="flex items-center gap-2 px-1 text-sm">
                <input
                  type="checkbox"
                  checked={pendingActivation}
                  onChange={(e) => setPendingActivation(e.target.checked)}
                />
                Pending SIM activation
              </label>
              <button
                type="button"
                className="pp-btn pp-btn-primary w-full"
                onClick={() => {
                  setPage(1);
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
          <span>{total} results</span>
          <div className="relative" ref={actionsRef}>
            <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setActionsOpen((v) => !v)}>
              Actions ▾
            </button>
            {actionsOpen && (
              <div className="pp-menu right-0 mt-2 w-52">
                <a href="/api/partner/esims/export" className="pp-menu-item">
                  Export Excel
                </a>
                <div className="mx-2 my-1 border-t border-white/10" />
                <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-[var(--pp-muted)]">
                  Per page
                </div>
                {[12, 24, 36, 48].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`pp-menu-item ${pageSize === n ? "active" : ""}`}
                    onClick={() => {
                      setPage(1);
                      setPageSize(n);
                      setActionsOpen(false);
                    }}
                  >
                    {n} / page
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loadError && (
        <div className="pp-card flex items-center justify-between gap-3 border-red-400/30 px-4 py-3 text-sm text-red-300">
          <span>{loadError}</span>
          <button type="button" className="pp-btn pp-btn-secondary px-3 py-1 text-xs" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-[var(--pp-muted)]">Loading…</div>
      )}

      {!loading && !loadError && !items.length && (
        <div className="pp-card py-16 text-center text-[var(--pp-muted)]">
          {showArchived ? "No archived eSIMs." : "No eSIMs found."}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="pp-esim-grid">
          {items.map((e) => (
            <article key={e.id} className="pp-esim-card">
              <div className="pp-esim-card-top">
                <RegionFlag region={e.region} regionCode={e.regionCode} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="pp-truncate text-sm font-semibold" title={e.planName}>
                    {e.planName || e.region}
                  </div>
                  <div className="pp-truncate text-xs text-[var(--pp-muted)]">
                    {e.nickname || e.assignee || "No nickname"}
                  </div>
                </div>
                {statusBadge(e)}
              </div>

              <dl className="pp-esim-card-meta">
                <div>
                  <dt>Region</dt>
                  <dd className="pp-truncate" title={e.region}>
                    {e.region || "—"}
                  </dd>
                </div>
                <div>
                  <dt>Data plan</dt>
                  <dd>{e.dataLabel || "—"}</dd>
                </div>
                <div>
                  <dt>Validity</dt>
                  <dd>{e.validityDays} days</dd>
                </div>
                <div>
                  <dt>Usage</dt>
                  <dd>{usageLabel(e)}</dd>
                </div>
                <div>
                  <dt>Expires</dt>
                  <dd>{formatDate(e.expiresAt)}</dd>
                </div>
                <div>
                  <dt>Issued</dt>
                  <dd>{formatDate(e.issuedAt)}</dd>
                </div>
                <div className="pp-esim-card-span">
                  <dt>ICCID</dt>
                  <dd className="pp-truncate font-mono text-[11px]" title={e.iccid || ""}>
                    {e.iccid || "—"}
                  </dd>
                </div>
                {e.networks && (
                  <div className="pp-esim-card-span">
                    <dt>Networks</dt>
                    <dd className="pp-truncate" title={e.networks}>
                      {e.networks}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="pp-esim-card-actions">
                <button
                  type="button"
                  className="pp-btn pp-btn-secondary flex-1 px-2 py-1.5 text-xs"
                  onClick={() => {
                    setDetail(e);
                    setShareUrl("");
                    setShareError("");
                    setShareCopied(false);
                    setSaveMsg(null);
                    setUsageText("");
                    fetch(`/api/partner/esims/${e.id}/usage`)
                      .then((r) => r.json())
                      .then((d) => {
                        if (d.usage) {
                          setUsageText(
                            `${d.usage.usedGb} / ${d.usage.totalGb} GB used · ${d.usage.remainingGb} GB left`,
                          );
                        }
                      })
                      .catch(() => undefined);
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost flex-1 px-2 py-1.5 text-xs"
                  disabled={busyId === e.id}
                  onClick={() => setArchived(e, !e.archived)}
                >
                  {busyId === e.id ? "…" : e.archived ? "Restore" : "Archive"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-[var(--pp-muted)]">
        <span>
          Page {page}/{pages}
        </span>
        <div className="flex gap-2">
          <button type="button" className="pp-btn pp-btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <button type="button" className="pp-btn pp-btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {detail && (
        <div className="pp-modal-backdrop">
          <div className="pp-modal max-w-lg">
            <div className="flex items-start justify-between gap-3 p-6 pb-3">
              <div className="flex min-w-0 items-start gap-3">
                <RegionFlag region={detail.region} regionCode={detail.regionCode} size="lg" />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{detail.planName}</h2>
                  <p className="text-sm text-[var(--pp-muted)]">
                    {detail.nickname || detail.assignee || detail.region}
                  </p>
                </div>
              </div>
              <button type="button" className="pp-btn pp-btn-secondary" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
            <div className="pp-modal-body space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-[var(--pp-muted)]">Status</dt>
                  <dd>{statusBadge(detail)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--pp-muted)]">Data</dt>
                  <dd>
                    {detail.dataLabel} · {usageText || usageLabel(detail)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--pp-muted)]">Expires</dt>
                  <dd>{formatDate(detail.expiresAt)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--pp-muted)]">Activated</dt>
                  <dd>{formatDate(detail.activatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--pp-muted)]">Paid</dt>
                  <dd>${detail.unitPaidUsd.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--pp-muted)]">Issued</dt>
                  <dd>{formatDate(detail.issuedAt)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[var(--pp-muted)]">Networks</dt>
                  <dd>{detail.networks || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[var(--pp-muted)]">Activation</dt>
                  <dd className="break-all font-mono text-xs">{detail.activationCode || "—"}</dd>
                </div>
              </dl>
              <div className="space-y-2">
                <input
                  className="pp-input"
                  value={detail.assignee}
                  onChange={(e) => setDetail({ ...detail, assignee: e.target.value })}
                  placeholder="Assignee / eSIM user"
                />
                <input
                  className="pp-input"
                  value={detail.nickname}
                  onChange={(e) => setDetail({ ...detail, nickname: e.target.value })}
                  placeholder="Nickname"
                />
                <textarea
                  className="pp-input"
                  value={detail.notes}
                  onChange={(e) => setDetail({ ...detail, notes: e.target.value })}
                  placeholder="Notes"
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="pp-btn pp-btn-secondary" onClick={saveNotes}>
                  Save
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-accent"
                  disabled={sharing}
                  onClick={() => createShare(detail.id)}
                >
                  {sharing ? "Creating…" : "Create QuickShare"}
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost"
                  disabled={busyId === detail.id}
                  onClick={() => setArchived(detail, !detail.archived)}
                >
                  {detail.archived ? "Restore from archive" : "Archive"}
                </button>
                {saveMsg && (
                  <span className={`text-xs ${saveMsg.ok ? "text-emerald-300" : "text-red-300"}`}>
                    {saveMsg.text}
                  </span>
                )}
              </div>
              {shareUrl && (
                <div className="space-y-2 rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-300">
                  <div className="break-all">{shareUrl}</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="pp-btn pp-btn-secondary px-3 py-1 text-xs"
                      onClick={() => copyShare(shareUrl)}
                    >
                      {shareCopied ? "Copied ✓" : "Copy link"}
                    </button>
                    <span className="text-white/40">Expires in 30 days</span>
                  </div>
                </div>
              )}
              {shareError && <div className="text-xs text-red-300">{shareError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
