"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RegionFlag } from "@/components/RegionFlag";
import { usePartnerCart } from "@/components/partner/PartnerCartProvider";
import {
  clearCart,
  readCart,
  removeFromCart,
  updateQty,
  type PartnerCartItem,
} from "@/lib/partner/cart";

function networkParts(networks: string) {
  const first = networks.split(/[,;|/]/)[0]?.trim() || "—";
  const speed =
    /\b5G\b/i.test(networks) ? "5G" : /\bLTE\b|\b4G\b/i.test(networks) ? "LTE" : "";
  return { name: first, speed };
}

export function CartClient() {
  const router = useRouter();
  const { refresh } = usePartnerCart();
  const [items, setItems] = useState<PartnerCartItem[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function sync() {
    setItems(readCart());
    refresh();
  }

  useEffect(() => {
    sync();
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => setBalance(d.partner?.balanceUsd ?? null))
      .catch(() => setBalance(null));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const retail = items.reduce((s, i) => s + i.suggestedRetail * i.quantity, 0);
  const discount = Math.max(0, retail - subtotal);
  const remaining =
    balance == null ? null : Math.round((balance - subtotal) * 100) / 100;

  async function checkout() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/partner/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ planId: i.planId, quantity: i.quantity })),
        packageType: "ESIM",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Checkout failed");
      return;
    }
    clearCart();
    refresh();
    router.push(`/partner/orders?highlight=${data.orderRef}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4">
      <Link href="/partner/store" className="pp-btn pp-btn-ghost px-0 text-[var(--pp-blue)]">
        ← Back to eSIM store
      </Link>
      <h1 className="text-2xl font-semibold">Your cart</h1>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="pp-table-wrap pp-table-fluid">
          <table className="pp-table">
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Package</th>
                <th>Type</th>
                <th>Network</th>
                <th>Price</th>
                <th>Total</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {!items.length && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[var(--pp-muted)]">
                    Cart is empty.
                  </td>
                </tr>
              )}
              {items.map((i) => {
                const net = networkParts(i.networks);
                return (
                  <tr key={i.planId}>
                    <td className="align-top">
                      <div className="flex flex-col gap-2 min-w-0">
                        <RegionFlag
                          region={i.region}
                          regionCode={i.regionCode}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold leading-snug break-words">{i.region}</div>
                          <div className="pp-cell-sub mt-0.5">
                            {i.dataLabel} · {i.validityDays} days
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <span className="pp-badge pp-badge-gray">eSIM</span>
                    </td>
                    <td className="align-middle">
                      <div className="text-sm leading-snug break-words" title={i.networks}>
                        {net.name}
                        {net.speed && <span className="pp-net-badge">{net.speed}</span>}
                      </div>
                    </td>
                    <td className="align-middle whitespace-nowrap">${i.unitPrice.toFixed(2)}</td>
                    <td className="align-middle whitespace-nowrap font-semibold">
                      ${(i.unitPrice * i.quantity).toFixed(2)}
                    </td>
                    <td className="align-middle">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <div className="inline-flex shrink-0 items-center rounded-lg border border-[var(--pp-border)]">
                          <button
                            type="button"
                            className="pp-btn pp-btn-ghost pp-btn-tab px-2 py-1.5"
                            onClick={() => {
                              updateQty(i.planId, Math.max(1, i.quantity - 1));
                              sync();
                            }}
                          >
                            –
                          </button>
                          <span className="min-w-7 text-center text-sm font-semibold">{i.quantity}</span>
                          <button
                            type="button"
                            className="pp-btn pp-btn-ghost pp-btn-tab px-2 py-1.5"
                            onClick={() => {
                              updateQty(i.planId, i.quantity + 1);
                              sync();
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="pp-btn pp-btn-icon shrink-0"
                          aria-label="Remove"
                          onClick={() => {
                            removeFromCart(i.planId);
                            sync();
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="pp-card space-y-3 p-5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--pp-muted)]">Retail value</span>
              <span>${retail.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="inline-flex items-center gap-2 text-[var(--pp-muted)]">
                Discount
                {discount > 0 && (
                  <span className="pp-badge pp-badge-green">
                    {retail ? Math.round((discount / retail) * 100) : 0}%
                  </span>
                )}
              </span>
              <span>- ${discount.toFixed(2)} USD</span>
            </div>
            <div className="border-t border-[var(--pp-border)] pt-3 flex justify-between font-semibold">
              <span>Order total</span>
              <span>${subtotal.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="pp-card space-y-3 p-5">
            <div className="text-sm font-semibold">Payment method</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-sm font-medium">Partner prepaid balance</div>
              <div className="mt-1 text-xs text-white/45">
                Available:{" "}
                <span className="font-semibold text-emerald-300">
                  {balance == null ? "…" : `$${balance.toFixed(2)} USD`}
                </span>
              </div>
              {remaining != null && (
                <div className="mt-1 text-xs text-white/45">
                  After checkout:{" "}
                  <span className={remaining < 0 ? "text-red-300" : "text-white/80"}>
                    ${remaining.toFixed(2)} USD
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-[var(--pp-muted)]">
              Orders are charged to your prepaid balance and delivered instantly.
            </p>
            {error && <p className="text-sm text-[var(--pp-danger)]">{error}</p>}
            <button
              type="button"
              className="pp-btn pp-btn-accent w-full"
              disabled={!items.length || loading || (remaining != null && remaining < 0)}
              onClick={checkout}
            >
              {loading ? "Placing order…" : "Place order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
