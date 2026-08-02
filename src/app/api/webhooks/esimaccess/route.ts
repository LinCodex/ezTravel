import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Inbound webhook receiver for eSIM Access Open API callbacks.
 *
 * eSIM Access signs callbacks with the same HMAC scheme as outbound requests:
 *   signature = HMAC-SHA256(secret, timestamp + requestId + accessCode + body)
 * sent via RT-Timestamp / RT-RequestID / RT-Signature headers.
 *
 * Handled notifyType values:
 *   ORDER_STATUS — supplier order allocated (GOT_RESOURCE) or failed
 *   SMDP_EVENT   — profile installed / enabled on the device → mark ACTIVE
 *   DATA_USAGE   — remaining data update → PartnerEsim.dataRemainingGb
 *
 * All handlers are idempotent: they look records up by esimTranNo (or
 * supplier orderNo) and only apply forward state transitions.
 */

type WebhookPayload = {
  notifyType?: string;
  content?: {
    orderNo?: string;
    orderStatus?: string;
    transactionId?: string;
    esimTranNo?: string;
    iccid?: string;
    smdpStatus?: string;
    esimStatus?: string;
    totalVolume?: number; // bytes
    remain?: number; // bytes
  };
};

const GB = 1024 * 1024 * 1024;

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Validate the callback signature. Strict when ESIMACCESS_SECRET_KEY is set;
 * otherwise reject in production (misconfiguration) and accept in dev/mock.
 */
function verifySignature(req: Request, rawBody: string): boolean {
  const secret = process.env.ESIMACCESS_SECRET_KEY?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const timestamp = req.headers.get("RT-Timestamp") || "";
  const requestId = req.headers.get("RT-RequestID") || "";
  const signature = req.headers.get("RT-Signature") || "";
  if (!timestamp || !requestId || !signature) return false;

  // Reject stale callbacks (> 5 minutes) to limit replay.
  const age = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(age) || age > 5 * 60 * 1000) return false;

  const accessCode = process.env.ESIMACCESS_ACCESS_CODE?.trim() || "";
  const payload = `${timestamp}${requestId}${accessCode}${rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex").toLowerCase();
  return safeEqual(expected, signature.toLowerCase());
}

async function handleOrderStatus(content: NonNullable<WebhookPayload["content"]>) {
  const { orderNo, transactionId, orderStatus } = content;
  if (!orderNo && !transactionId) return { handled: false, reason: "no order reference" };

  const success = orderStatus === "GOT_RESOURCE" || orderStatus === "SUCCESS";
  const failed = orderStatus === "FAILED" || orderStatus === "CANCEL" || orderStatus === "REFUND";
  if (!success && !failed) return { handled: false, reason: `ignored orderStatus ${orderStatus}` };

  // Consumer orders reference the supplier order by supplierOrderNo, or by our
  // orderRef passed as transactionId at order time.
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(orderNo ? [{ supplierOrderNo: orderNo }] : []),
        ...(transactionId ? [{ orderRef: transactionId }] : []),
      ],
    },
  });

  if (order) {
    if (failed && order.status !== "DELIVERED" && order.status !== "FAILED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED", failureReason: `Supplier reported ${orderStatus}` },
      });
    }
    // Success for a not-yet-delivered order: profile details arrive via
    // /esim/query polling or SMDP events; nothing to do here beyond logging.
    return { handled: true };
  }

  // Partner eSIMs (transactionId format: `${orderRef}-${planId}-${n}`)
  if (failed && orderNo) {
    await prisma.partnerEsim.updateMany({
      where: { supplierOrderNo: orderNo, status: { notIn: ["REFUNDED", "REVOKED"] } },
      data: { status: "SUSPENDED", notes: `Supplier reported ${orderStatus}` },
    });
    return { handled: true };
  }
  return { handled: false, reason: "no matching order" };
}

async function handleSmdpEvent(content: NonNullable<WebhookPayload["content"]>) {
  const { esimTranNo, iccid, smdpStatus } = content;
  if (!esimTranNo && !iccid) return { handled: false, reason: "no esim reference" };

  const installedStates = ["INSTALLATION", "INSTALLED", "ENABLED", "ENABLE"];
  const removedStates = ["DELETED", "DISABLED"];

  const where = {
    OR: [
      ...(esimTranNo ? [{ esimTranNo }] : []),
      ...(iccid ? [{ iccid }] : []),
    ],
  };

  if (smdpStatus && installedStates.includes(smdpStatus.toUpperCase())) {
    await prisma.partnerEsim.updateMany({
      where: { ...where, status: "PENDING_ACTIVATION" },
      data: { status: "ACTIVE", activatedAt: new Date() },
    });
    return { handled: true };
  }
  if (smdpStatus && removedStates.includes(smdpStatus.toUpperCase())) {
    await prisma.partnerEsim.updateMany({
      where: { ...where, status: { in: ["ACTIVE", "PENDING_ACTIVATION"] } },
      data: { status: "SUSPENDED" },
    });
    return { handled: true };
  }
  return { handled: false, reason: `ignored smdpStatus ${smdpStatus}` };
}

async function handleDataUsage(content: NonNullable<WebhookPayload["content"]>) {
  const { esimTranNo, iccid, remain } = content;
  if ((!esimTranNo && !iccid) || remain == null) {
    return { handled: false, reason: "missing esim reference or remain" };
  }
  const remainingGb = Math.max(0, Math.round((remain / GB) * 100) / 100);
  await prisma.partnerEsim.updateMany({
    where: {
      OR: [
        ...(esimTranNo ? [{ esimTranNo }] : []),
        ...(iccid ? [{ iccid }] : []),
      ],
    },
    data: { dataRemainingGb: remainingGb },
  });
  return { handled: true };
}

export async function POST(req: Request) {
  const limited = rateLimit(clientKey(req, "webhook-esimaccess"), {
    limit: 120,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const rawBody = await req.text();

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload | null = null;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const notifyType = payload?.notifyType?.toUpperCase() || "";
  const content = payload?.content || {};

  let result: { handled: boolean; reason?: string };
  switch (notifyType) {
    case "ORDER_STATUS":
      result = await handleOrderStatus(content);
      break;
    case "SMDP_EVENT":
    case "ESIM_STATUS":
      result = await handleSmdpEvent(content);
      break;
    case "DATA_USAGE":
      result = await handleDataUsage(content);
      break;
    default:
      result = { handled: false, reason: `unknown notifyType ${notifyType}` };
  }

  // Always 200 so the supplier doesn't retry events we deliberately ignore.
  return NextResponse.json({ received: true, ...result });
}
