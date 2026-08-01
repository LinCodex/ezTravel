"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { regionDisplayName } from "@/lib/i18n/region-names";
import { formatData, formatUsd } from "@/lib/utils";

interface GroupItem {
  orderRef: string;
  status: string;
  amountUsd: number;
  days: number;
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

interface GroupData {
  cartGroup: string;
  status: string;
  paymentMethod: string;
  totalUsd: number;
  email: string;
  createdAt: string;
  paymentQrDataUrl: string | null;
  orderRefs: string[];
  items: GroupItem[];
}

const POLL_MS = 8000;

export function CartGroupStatus({
  cartGroup,
  email,
}: {
  cartGroup: string;
  email: string;
}) {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<GroupData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    const res = await fetch(
      `/api/orders/group/${encodeURIComponent(cartGroup)}?email=${encodeURIComponent(email)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      setNotFound(true);
      return null;
    }
    const json: GroupData = await res.json();
    setData(json);
    return json;
  }, [cartGroup, email]);

  useEffect(() => {
    fetchGroup();
    const id = setInterval(async () => {
      const next = await fetchGroup();
      if (next && next.status !== "AWAITING_CONFIRMATION" && next.status !== "AWAITING_PAYMENT") {
        clearInterval(id);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchGroup]);

  async function paySquare() {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch(
        `/api/orders/group/${encodeURIComponent(cartGroup)}/square-pay`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) throw new Error("pay failed");
      await fetchGroup();
    } catch {
      setPayError(t.common.error);
    } finally {
      setPaying(false);
    }
  }

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

  if (!data) {
    return (
      <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
        <div className="max-w-xl mx-auto">
          <p className="text-white/50">{t.common.loading}</p>
        </div>
      </section>
    );
  }

  const statusLabel =
    data.status === "AWAITING_PAYMENT"
      ? t.order.statusAwaitingPayment
      : data.status === "AWAITING_CONFIRMATION"
        ? t.order.statusAwaitingConfirmation
        : data.status === "DELIVERED"
          ? t.order.statusDelivered
          : t.order.statusCancelled;

  const recipientName = process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_NAME || "ezTravel LLC";
  const recipientHandle =
    process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_HANDLE || "pay@eztravel.example.com";

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-2xl mx-auto">
        <p className="text-white/50 text-sm">{t.cart.title}</p>
        <h1 className="hero-title text-4xl md:text-5xl font-medium mt-2">
          {data.cartGroup}
        </h1>
        <p className="text-white/40 text-xs mt-2">
          {data.items.length} {t.cart.items}
        </p>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-6">
          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                data.status === "DELIVERED"
                  ? "bg-green-400"
                  : data.status === "CANCELLED"
                    ? "bg-red-400"
                    : "bg-yellow-400 animate-pulse"
              }`}
            />
            <p className="text-white text-base font-medium">{statusLabel}</p>
          </div>
          {data.status === "AWAITING_CONFIRMATION" && (
            <p className="text-white/60 text-sm mt-4 leading-relaxed">
              {t.order.awaitingNote}
            </p>
          )}
        </div>

        {data.status === "AWAITING_CONFIRMATION" && data.paymentMethod === "ZELLE" && (
          <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
            <p className="text-white text-sm font-medium">{t.pay.titleZelle}</p>
            <ol className="mt-4 flex flex-col gap-4 text-sm">
              <li>
                <p className="text-white/60">{t.pay.zelleStep1}</p>
                <div className="bg-neutral-800 rounded-xl px-4 py-3 mt-2">
                  <p className="text-white font-medium">{recipientName}</p>
                  <p className="text-white/70">{recipientHandle}</p>
                  <p className="text-white text-lg font-medium mt-1">
                    {t.pay.amountDue}: {formatUsd(data.totalUsd)}
                  </p>
                </div>
              </li>
              <li>
                <p className="text-white/60">{t.pay.zelleStep2}</p>
                <p className="bg-neutral-800 rounded-xl px-4 py-3 mt-2 text-white font-mono tracking-wider">
                  {data.cartGroup}
                </p>
              </li>
              <li className="text-white/60">{t.pay.zelleStep3}</li>
            </ol>
          </div>
        )}

        {data.status === "AWAITING_CONFIRMATION" && data.paymentMethod === "WECHAT" && (
          <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
            <p className="text-white text-sm font-medium">{t.pay.titleWechat}</p>
            <div className="mt-4 flex flex-col gap-4 text-sm">
              <p className="text-white/60">{t.pay.wechatStep1}</p>
              {data.paymentQrDataUrl && (
                <div className="self-center text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.paymentQrDataUrl}
                    alt="wechat pay qr"
                    className="rounded-xl w-56 h-56 bg-white"
                  />
                  <p className="text-white text-lg font-medium mt-2">
                    {t.pay.amountDue}: {formatUsd(data.totalUsd)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-white/60">{t.pay.wechatStep2}</p>
                <p className="bg-neutral-800 rounded-xl px-4 py-3 mt-2 text-white font-mono tracking-wider">
                  {data.cartGroup}
                </p>
              </div>
            </div>
          </div>
        )}

        {data.status === "AWAITING_PAYMENT" && data.paymentMethod === "SQUARE" && (
          <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
            <p className="text-white text-sm font-medium">{t.pay.titleSquare}</p>
            <p className="text-white/50 text-xs mt-2">{t.pay.squareMockNote}</p>
            <p className="text-white text-lg font-medium mt-4">
              {t.pay.amountDue}: {formatUsd(data.totalUsd)}
            </p>
            {payError && <p className="text-red-400 text-sm mt-3">{payError}</p>}
            <button
              type="button"
              onClick={paySquare}
              disabled={paying}
              className="mt-4 w-full bg-white text-black text-sm rounded-full px-6 py-3.5 hover:bg-neutral-200 transition-colors btn-press disabled:opacity-60"
            >
              {paying ? t.pay.processing : t.pay.payNow}
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {data.items.map((item) => (
            <div
              key={item.orderRef}
              className="bg-neutral-900/80 rounded-2xl p-5 ring-1 ring-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-medium">
                    {regionDisplayName(item.plan.region, locale)} ·{" "}
                    {formatData(item.plan.gb)}
                    {item.plan.dataType === "Daily Unlimited" ? t.plan.perDay : ""}
                  </p>
                  <p className="text-white/40 text-xs mt-1 font-mono">
                    {item.orderRef}
                  </p>
                  <p className="text-white/45 text-xs mt-1">
                    {item.plan.dataType === "Daily Unlimited"
                      ? `${item.days} ${t.plan.days}`
                      : `${item.plan.validityDays} ${t.plan.days}`}{" "}
                    · {formatUsd(item.amountUsd)}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/50 bg-black/30 rounded-full px-2.5 py-1">
                  {item.status === "DELIVERED"
                    ? t.order.statusDelivered
                    : item.status === "AWAITING_PAYMENT"
                      ? t.order.statusAwaitingPayment
                      : item.status === "AWAITING_CONFIRMATION"
                        ? t.order.statusAwaitingConfirmation
                        : t.order.statusCancelled}
                </span>
              </div>

              {item.esim?.qrDataUrl && (
                <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.esim.qrDataUrl}
                    alt="esim qr"
                    className="rounded-xl w-40 h-40 bg-white"
                  />
                  <div className="text-xs text-white/60 space-y-1.5 break-all">
                    {item.esim.activationCode && (
                      <p>
                        <span className="text-white/40">{t.order.activationCode}: </span>
                        {item.esim.activationCode}
                      </p>
                    )}
                    {item.esim.smdpAddress && (
                      <p>
                        <span className="text-white/40">{t.order.smdp}: </span>
                        {item.esim.smdpAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-neutral-900/80 rounded-2xl p-5 md:p-6 mt-4">
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-white/50">{t.cart.subtotal}</dt>
            <dd className="text-white text-right font-medium">
              {formatUsd(data.totalUsd)}
            </dd>
            <dt className="text-white/50">{t.order.email}</dt>
            <dd className="text-white text-right break-all">{data.email}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
