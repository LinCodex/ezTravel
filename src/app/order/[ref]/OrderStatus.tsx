"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatData, formatUsd } from "@/lib/utils";

interface OrderData {
  orderRef: string;
  status: string;
  paymentMethod: string;
  amountUsd: number;
  days: number;
  email: string;
  createdAt: string;
  paymentQrDataUrl: string | null;
  plan: {
    name: string;
    region: string;
    dataType: string;
    gb: number;
    validityDays: number;
  };
  esim: {
    iccid: string | null;
    activationCode: string | null;
    smdpAddress: string | null;
    qrDataUrl: string | null;
  } | null;
}

const POLL_MS = 8000;
const MAX_WAIT_MS = 60 * 60 * 1000;

function useCountdown(createdAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!createdAt) return null;
  const remaining = new Date(createdAt).getTime() + MAX_WAIT_MS - now;
  return remaining;
}

export function OrderStatus({ orderRef, email }: { orderRef: string; email: string }) {
  const { t, locale } = useLanguage();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(
      `/api/orders/${encodeURIComponent(orderRef)}?email=${encodeURIComponent(email)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      setNotFound(true);
      return null;
    }
    const data: OrderData = await res.json();
    setOrder(data);
    return data;
  }, [orderRef, email]);

  useEffect(() => {
    fetchOrder();
    const id = setInterval(async () => {
      const data = await fetchOrder();
      if (data && data.status !== "AWAITING_CONFIRMATION") {
        // Delivered/cancelled orders don't change anymore; stop polling.
        if (data.status !== "AWAITING_PAYMENT") clearInterval(id);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchOrder]);

  const remaining = useCountdown(order?.createdAt);

  if (notFound) {
    return (
      <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
        <div className="max-w-xl mx-auto">
          <p className="text-white/70">{t.order.lookupNotFound}</p>
          <Link href="/order" className="text-white underline text-sm mt-4 inline-block">
            {t.order.lookupTitle}
          </Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
        <div className="max-w-xl mx-auto">
          <p className="text-white/50">{t.common.loading}</p>
        </div>
      </section>
    );
  }

  const statusLabel =
    order.status === "AWAITING_PAYMENT"
      ? t.order.statusAwaitingPayment
      : order.status === "AWAITING_CONFIRMATION"
        ? t.order.statusAwaitingConfirmation
        : order.status === "PAID"
          ? t.order.statusPaid
          : order.status === "DELIVERED"
            ? t.order.statusDelivered
            : t.order.statusCancelled;

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-2xl mx-auto">
        <p className="text-white/50 text-sm animate-fade-up">{t.order.title}</p>
        <h1 className="hero-title text-4xl md:text-5xl font-medium mt-2 animate-fade-up delay-100">
          {order.orderRef}
        </h1>

        <SaveLinkBanner />

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-200">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                order.status === "DELIVERED"
                  ? "bg-green-400"
                  : order.status === "CANCELLED"
                    ? "bg-red-400"
                    : "bg-yellow-400 animate-pulse"
              }`}
            />
            <p className="text-white text-base font-medium">{statusLabel}</p>
          </div>

          {order.status === "AWAITING_CONFIRMATION" && (
            <div className="mt-4">
              <p className="text-white/60 text-sm leading-relaxed">{t.order.awaitingNote}</p>
              {remaining !== null && remaining > 0 && (
                <p className="text-white/40 text-xs mt-2">
                  {t.order.timeRemaining}:{" "}
                  <span className="text-white/70 tabular-nums">
                    {Math.floor(remaining / 60000)}:
                    {String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}
                  </span>
                </p>
              )}
              {remaining !== null && remaining <= 0 && (
                <p className="text-yellow-400/80 text-xs mt-2">{t.order.overdue}</p>
              )}
            </div>
          )}
        </div>

        {order.status === "AWAITING_CONFIRMATION" && order.paymentMethod === "ZELLE" && (
          <ZelleInstructions order={order} />
        )}
        {order.status === "AWAITING_CONFIRMATION" && order.paymentMethod === "WECHAT" && (
          <WechatInstructions order={order} />
        )}
        {order.status === "AWAITING_PAYMENT" && order.paymentMethod === "SQUARE" && (
          <SquareForm order={order} email={email} onPaid={fetchOrder} />
        )}
        {order.status === "DELIVERED" && order.esim && <EsimDelivery order={order} />}

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-400">
          <p className="text-white text-sm font-medium">{t.order.detailsTitle}</p>
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-white/50">{t.order.plan}</dt>
            <dd className="text-white text-right">
              {regionDisplayName(order.plan.region, locale)} · {formatData(order.plan.gb)}
              {order.plan.dataType === "Daily Unlimited"
                ? `${t.plan.perDay} × ${order.days} ${t.plan.days}`
                : ` · ${order.plan.validityDays} ${t.plan.days}`}
            </dd>
            <dt className="text-white/50">{t.order.paymentMethod}</dt>
            <dd className="text-white text-right">
              {order.paymentMethod === "ZELLE"
                ? t.checkout.zelle
                : order.paymentMethod === "WECHAT"
                  ? t.checkout.wechatPay
                  : t.checkout.square}
            </dd>
            <dt className="text-white/50">{t.order.amount}</dt>
            <dd className="text-white text-right">{formatUsd(order.amountUsd)}</dd>
            <dt className="text-white/50">{t.order.email}</dt>
            <dd className="text-white text-right break-all">{order.email}</dd>
            <dt className="text-white/50">{t.order.placedAt}</dt>
            <dd className="text-white text-right">
              {new Date(order.createdAt).toLocaleString()}
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

function SaveLinkBanner() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-yellow-500/5 ring-1 ring-yellow-500/20 rounded-2xl p-4 md:p-5 mt-6 animate-fade-up delay-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="text-yellow-400/90 text-sm font-medium">{t.order.saveLinkTitle}</p>
        <p className="text-white/50 text-xs mt-1 leading-relaxed">{t.order.saveLinkText}</p>
      </div>
      <button
        onClick={copy}
        className="bg-white text-black text-xs rounded-full px-4 py-2.5 hover:bg-neutral-200 transition-colors btn-press shrink-0"
      >
        {copied ? t.order.linkCopied : t.order.copyLink}
      </button>
    </div>
  );
}

function ZelleInstructions({ order }: { order: OrderData }) {
  const { t } = useLanguage();
  const recipientName = process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_NAME || "ezTravel LLC";
  const recipientHandle =
    process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_HANDLE || "pay@eztravel.example.com";

  return (
    <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-300">
      <p className="text-white text-sm font-medium">{t.pay.titleZelle}</p>
      <ol className="mt-4 flex flex-col gap-4 text-sm">
        <li>
          <p className="text-white/60">{t.pay.zelleStep1}</p>
          <div className="bg-neutral-800 rounded-xl px-4 py-3 mt-2">
            <p className="text-white font-medium">{recipientName}</p>
            <p className="text-white/70">{recipientHandle}</p>
            <p className="text-white text-lg font-medium mt-1">
              {t.pay.amountDue}: {formatUsd(order.amountUsd)}
            </p>
          </div>
        </li>
        <li>
          <p className="text-white/60">{t.pay.zelleStep2}</p>
          <p className="bg-neutral-800 rounded-xl px-4 py-3 mt-2 text-white font-mono tracking-wider">
            {order.orderRef}
          </p>
        </li>
        <li className="text-white/60">{t.pay.zelleStep3}</li>
      </ol>
    </div>
  );
}

function WechatInstructions({ order }: { order: OrderData }) {
  const { t } = useLanguage();

  return (
    <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-300">
      <p className="text-white text-sm font-medium">{t.pay.titleWechat}</p>
      <div className="mt-4 flex flex-col gap-4 text-sm">
        <p className="text-white/60">{t.pay.wechatStep1}</p>
        {order.paymentQrDataUrl && (
          <div className="self-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.paymentQrDataUrl}
              alt="wechat pay qr"
              className="rounded-xl w-56 h-56 bg-white"
            />
            <p className="text-white/40 text-[11px] mt-2">{t.pay.mockQrLabel}</p>
            <p className="text-white text-lg font-medium mt-1">
              {t.pay.amountDue}: {formatUsd(order.amountUsd)}
            </p>
          </div>
        )}
        <div>
          <p className="text-white/60">{t.pay.wechatStep2}</p>
          <p className="bg-neutral-800 rounded-xl px-4 py-3 mt-2 text-white font-mono tracking-wider">
            {order.orderRef}
          </p>
        </div>
        <p className="text-white/60">{t.pay.wechatStep3}</p>
      </div>
    </div>
  );
}

function SquareForm({
  order,
  email,
  onPaid,
}: {
  order: OrderData;
  email: string;
  onPaid: () => void;
}) {
  const { t } = useLanguage();
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    card.replace(/\s/g, "").length >= 15 && expiry.length >= 4 && cvc.length >= 3 && name;

  async function pay() {
    setProcessing(true);
    setError(null);
    const res = await fetch(
      `/api/orders/${encodeURIComponent(order.orderRef)}/square-pay`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    if (res.ok) {
      onPaid();
    } else {
      setError(t.common.error);
      setProcessing(false);
    }
  }

  return (
    <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-300">
      <p className="text-white text-sm font-medium">{t.pay.titleSquare}</p>
      <div className="mt-4 flex flex-col gap-3">
        <input
          value={card}
          onChange={(e) => setCard(e.target.value.replace(/[^\d\s]/g, ""))}
          placeholder={t.pay.cardNumber}
          inputMode="numeric"
          className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
        />
        <div className="flex gap-3">
          <input
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder={t.pay.cardExpiry}
            className="w-1/2 bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
          />
          <input
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
            placeholder={t.pay.cardCvc}
            inputMode="numeric"
            className="w-1/2 bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.pay.cardName}
          className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={pay}
          disabled={!valid || processing}
          className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50 mt-1"
        >
          {processing
            ? t.pay.processing
            : `${t.pay.payNow} · ${formatUsd(order.amountUsd)}`}
        </button>
        <p className="text-white/30 text-[11px]">{t.pay.squareMockNote}</p>
      </div>
    </div>
  );
}

function EsimDelivery({ order }: { order: OrderData }) {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const esim = order.esim!;
  const steps = platform === "ios" ? t.order.installIos : t.order.installAndroid;

  return (
    <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4 animate-fade-up delay-300">
      <p className="text-white text-sm font-medium">{t.order.yourEsim}</p>

      {esim.qrDataUrl && (
        <div className="mt-5 text-center">
          <p className="text-white/60 text-sm mb-3">{t.order.scanTitle}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={esim.qrDataUrl}
            alt="esim qr code"
            className="rounded-xl w-64 h-64 bg-white mx-auto"
          />
          <p className="text-white/40 text-xs mt-3 max-w-sm mx-auto">{t.order.scanHint}</p>
        </div>
      )}

      <dl className="mt-6 flex flex-col gap-3 text-sm">
        <div>
          <dt className="text-white/50 text-xs">{t.order.activationCode}</dt>
          <dd className="text-white font-mono text-xs bg-neutral-800 rounded-xl px-4 py-3 mt-1 break-all">
            {esim.activationCode}
          </dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-white/50 text-xs">{t.order.smdp}</dt>
            <dd className="text-white font-mono text-xs bg-neutral-800 rounded-xl px-4 py-3 mt-1 break-all">
              {esim.smdpAddress}
            </dd>
          </div>
          <div>
            <dt className="text-white/50 text-xs">{t.order.iccid}</dt>
            <dd className="text-white font-mono text-xs bg-neutral-800 rounded-xl px-4 py-3 mt-1 break-all">
              {esim.iccid}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-6">
        <div className="flex items-center gap-1 bg-neutral-800 rounded-full px-1.5 py-1.5 w-fit">
          <button
            onClick={() => setPlatform("ios")}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              platform === "ios" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => setPlatform("android")}
            className={`text-xs px-4 py-1.5 rounded-full transition-colors ${
              platform === "android"
                ? "bg-white text-black"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Android
          </button>
        </div>
        <p className="text-white/70 text-sm font-medium mt-4">{t.order.installTitle}</p>
        <ol className="mt-2 flex flex-col gap-2">
          {steps.map((s, i) => (
            <li key={i} className="text-white/60 text-sm flex gap-3">
              <span className="text-white/30">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
