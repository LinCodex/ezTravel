/**
 * Lightweight email helper. Prefers Resend when RESEND_API_KEY is set;
 * otherwise logs the message (dev-safe).
 */

import { appOrigin } from "@/lib/app-url";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  const from = process.env.EMAIL_FROM?.trim() || "noreply@eztravel.local";
  const key = process.env.RESEND_API_KEY?.trim();

  if (!opts.to) return { ok: false };

  if (!key) {
    console.info("[email:dev]", { to: opts.to, subject: opts.subject, text: opts.text || opts.html });
    return { ok: true, skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend failed", res.status, body);
    return { ok: false };
  }
  return { ok: true };
}

export function partnerOrderEmailHtml(opts: {
  companyName: string;
  brandName: string;
  orderRef: string;
  deliveryUrl: string;
  totalUsd: number;
  quantity: number;
}) {
  const brand = opts.brandName || opts.companyName;
  return `
  <div style="font-family:system-ui,sans-serif;background:#000;color:#fff;padding:24px">
    <h1 style="margin:0 0 8px;font-size:22px">${brand}</h1>
    <p style="color:#bbb">Your partner order is ready.</p>
    <p><strong>Order:</strong> ${opts.orderRef}</p>
    <p><strong>Quantity:</strong> ${opts.quantity}</p>
    <p><strong>Total charged:</strong> $${opts.totalUsd.toFixed(2)}</p>
    <p><a href="${opts.deliveryUrl}" style="display:inline-block;margin-top:12px;background:#10b981;color:#000;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">View eSIM delivery</a></p>
  </div>`;
}

export function consumerDeliveryEmailHtml(opts: {
  orderRef: string;
  planName: string;
  activationCode: string | null;
  iccid: string | null;
}) {
  const orderUrl = `${appOrigin()}/order/${opts.orderRef}`;
  return `
  <div style="font-family:system-ui,sans-serif;background:#000;color:#fff;padding:24px">
    <h1 style="margin:0 0 8px;font-size:22px">ezTravel</h1>
    <p style="color:#bbb">Your eSIM is ready to install.</p>
    <p><strong>Order:</strong> ${opts.orderRef}</p>
    <p><strong>Plan:</strong> ${opts.planName}</p>
    ${opts.iccid ? `<p><strong>ICCID:</strong> ${opts.iccid}</p>` : ""}
    ${
      opts.activationCode
        ? `<p style="word-break:break-all"><strong>Activation code:</strong><br/><code style="color:#6ee7b7">${opts.activationCode}</code></p>`
        : ""
    }
    <p><a href="${orderUrl}" style="display:inline-block;margin-top:12px;background:#10b981;color:#000;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Open delivery page</a></p>
    <p style="color:#666;font-size:12px;margin-top:16px">Scan the QR on the delivery page, or paste the LPA activation code into your device eSIM settings.</p>
  </div>`;
}

export async function sendConsumerDeliveryEmail(opts: {
  to: string;
  orderRef: string;
  planName: string;
  activationCode: string | null;
  iccid: string | null;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Your ezTravel eSIM is ready — ${opts.orderRef}`,
    html: consumerDeliveryEmailHtml(opts),
    text: `Your eSIM for ${opts.planName} is ready. Order ${opts.orderRef}. Open ${appOrigin()}/order/${opts.orderRef}`,
  });
}
