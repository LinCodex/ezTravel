"use client";

import { useEffect, useState } from "react";
import { androidEsimInstallUrl, iosEsimInstallUrl } from "@/lib/partner/lpa-links";

export type BrandTheme = {
  brandName: string;
  brandAlias: string;
  brandColor: string;
  brandLogoUrl: string;
  brandHeroUrl: string;
  supportEmail: string;
  supportPhone: string;
};

export type DeliveryEsim = {
  iccid: string | null;
  activationCode: string | null;
  smdpAddress: string | null;
  planName: string;
  region: string;
  dataLabel: string;
  validityDays: number;
  nickname?: string;
  assignee?: string;
  qrDataUrl?: string | null;
};

// Lazy-load the qrcode library only when a QR wasn't pre-rendered on the server
// (e.g. the settings live preview). Keeps it out of the main client bundle.
async function makeQr(code: string | null | undefined) {
  if (!code) return null;
  try {
    const QRCode = (await import("qrcode")).default;
    return await QRCode.toDataURL(code, {
      margin: 1,
      width: 280,
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}

function BrandMark({ brand, color }: { brand: BrandTheme; color: string }) {
  if (brand.brandLogoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.brandLogoUrl} alt="" className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/15" />;
  }
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-black shadow-[0_0_24px_-6px_currentColor]"
      style={{ background: color, color: "#000" }}
    >
      {(brand.brandName || "P").slice(0, 1).toUpperCase()}
    </div>
  );
}

function EsimCard({
  esim,
  color,
  qr,
}: {
  esim: DeliveryEsim;
  color: string;
  qr: string | null;
}) {
  const activation = esim.activationCode || "";
  const iosUrl = activation ? iosEsimInstallUrl(activation) : "#";
  const androidUrl = activation ? androidEsimInstallUrl(activation) : "#";

  return (
    <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold tracking-tight">{esim.planName}</div>
          <div className="mt-1 text-sm text-white/50">
            {esim.region} · {esim.dataLabel} · {esim.validityDays} days
          </div>
          {(esim.nickname || esim.assignee) && (
            <div className="mt-2 text-xs text-white/40">{esim.nickname || esim.assignee}</div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={iosUrl}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.97]"
              style={{ background: "#ffffff", color: "#0a0a0a" }}
              {...(activation ? {} : { onClick: (e) => e.preventDefault() })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16.5 3.5c-.9.1-2 .7-2.6 1.5-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3.6-.8 1.1-1.9.9-3zM19.8 17.2c-.5 1.1-.7 1.6-1.4 2.5-.9 1.2-2.1 2.7-3.7 2.7-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.5 0-2.7-1.4-3.6-2.6C2.2 17.3 1 13.6 2.6 10.8c.9-1.5 2.4-2.5 4.1-2.5 1.5 0 2.8 1 3.7 1 .9 0 2.4-1.2 4.1-1 1 .1 3.4.4 4.9 3.1-.1.1-2.9 1.7-2.6 5.8z" />
              </svg>
              Install on iOS
            </a>
            <a
              href={androidUrl}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold transition active:scale-[0.97]"
              style={{ background: "rgba(255,255,255,0.06)", color: "#ffffff" }}
              {...(activation ? {} : { onClick: (e) => e.preventDefault() })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.6 9.5l1.9-3.3c.1-.2 0-.5-.2-.6-.2-.1-.5 0-.6.2l-1.9 3.3A8.3 8.3 0 0012 8c-1.7 0-3.3.5-4.7 1.3L5.4 5.9c-.1-.2-.4-.3-.6-.2-.2.1-.3.4-.2.6l1.9 3.3A8 8 0 004 15.5v.7c0 .9.7 1.6 1.6 1.6h.8v2.6c0 .9.7 1.6 1.6 1.6s1.6-.7 1.6-1.6v-2.6h4.8v2.6c0 .9.7 1.6 1.6 1.6s1.6-.7 1.6-1.6v-2.6h.8c.9 0 1.6-.7 1.6-1.6v-.7c0-2.4-1.1-4.5-2.8-6zM9 14.2a1 1 0 110-2 1 1 0 010 2zm6 0a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              Install on Android
            </a>
          </div>
          <p className="mt-2 text-[11px] text-white/35">
            Quick install uses LPA activation. On desktop, open this page from your phone.
          </p>
        </div>

        <div className="mx-auto shrink-0 sm:mx-0">
          <div
            className="rounded-3xl bg-white p-3 shadow-[0_0_40px_-12px]"
            style={{ boxShadow: `0 0 40px -10px ${color}` }}
          >
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="eSIM QR code" className="h-[180px] w-[180px] sm:h-[200px] sm:w-[200px]" />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center text-xs text-neutral-400 sm:h-[200px] sm:w-[200px]">
                QR unavailable
              </div>
            )}
          </div>
          <div className="mt-2 text-center text-[11px] text-white/40">Scan to install</div>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
          <dt className="text-xs text-white/40">ICCID</dt>
          <dd className="mt-1 break-all font-medium">{esim.iccid || "—"}</dd>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
          <dt className="text-xs text-white/40">SM-DP+</dt>
          <dd className="mt-1 break-all font-medium">{esim.smdpAddress || "—"}</dd>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3 sm:col-span-2">
          <dt className="text-xs text-white/40">Activation code (LPA)</dt>
          <dd className="mt-1 break-all font-medium">{esim.activationCode || "—"}</dd>
        </div>
      </dl>

      <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm text-white/55">
        <li>Tap Install on iOS / Android, or scan the QR code.</li>
        <li>Allow cellular plan installation when prompted.</li>
        <li>Enable the line and turn on data roaming when you arrive.</li>
      </ol>
    </section>
  );
}

export function BrandedDeliveryView({
  brand,
  orderRef,
  esims,
  preview = false,
  className = "",
}: {
  brand: BrandTheme;
  orderRef: string;
  esims: DeliveryEsim[];
  preview?: boolean;
  className?: string;
}) {
  const color = brand.brandColor || "#10b981";
  const [qrMap, setQrMap] = useState<Record<number, string | null>>({});

  useEffect(() => {
    // Skip entirely when every QR was pre-rendered server-side
    if (esims.every((e) => e.qrDataUrl !== undefined)) {
      setQrMap(Object.fromEntries(esims.map((e, i) => [i, e.qrDataUrl ?? null])));
      return;
    }
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        esims.map(async (e, i) => [i, e.qrDataUrl ?? (await makeQr(e.activationCode))] as const),
      );
      if (cancelled) return;
      const next: Record<number, string | null> = {};
      for (const [i, qr] of entries) next[i] = qr;
      setQrMap(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [esims]);

  return (
    <div className={`bg-black text-white ${className}`}>
      {preview && (
        <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2 text-center text-[11px] tracking-wide text-white/40">
          Live customer preview · /p/{brand.brandAlias || "alias"}/order/{orderRef}
        </div>
      )}

      <div
        className="relative overflow-hidden border-b border-white/10"
        style={{
          background: brand.brandHeroUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,.55), #000), url(${brand.brandHeroUrl}) center/cover`
            : `radial-gradient(ellipse 80% 70% at 50% -10%, ${color}40, transparent 55%), #000`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-3">
            <BrandMark brand={brand} color={color} />
            <div>
              <div className="text-xl font-semibold tracking-tight">{brand.brandName || "Your brand"}</div>
              <div className="text-xs text-white/45">Order {orderRef}</div>
            </div>
          </div>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">Your eSIM is ready</h1>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            Scan the QR code or use the quick install buttons. Keep this page for your records.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {esims.map((e, idx) => (
          <EsimCard key={`${e.iccid}-${idx}`} esim={e} color={color} qr={qrMap[idx] ?? null} />
        ))}

        <footer className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/50">
          Need help?{" "}
          {brand.supportEmail ? (
            <a className="text-white underline decoration-white/30 underline-offset-2" href={`mailto:${brand.supportEmail}`}>
              {brand.supportEmail}
            </a>
          ) : (
            <span className="text-white/35">support email</span>
          )}
          {brand.supportPhone && (
            <>
              {" · "}
              <a className="text-white underline decoration-white/30 underline-offset-2" href={`tel:${brand.supportPhone}`}>
                {brand.supportPhone}
              </a>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
