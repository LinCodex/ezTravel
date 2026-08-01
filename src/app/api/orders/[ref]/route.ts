import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { orderRef: ref.toUpperCase() },
    include: { plan: true },
  });
  if (!order || order.email !== email) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let qrDataUrl: string | null = null;
  if (order.status === "DELIVERED" && order.esimActivation) {
    qrDataUrl = await QRCode.toDataURL(order.esimActivation, {
      width: 320,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }

  // Mock WeChat Pay QR shown while awaiting manual confirmation.
  let paymentQrDataUrl: string | null = null;
  if (order.status === "AWAITING_CONFIRMATION" && order.paymentMethod === "WECHAT") {
    paymentQrDataUrl = await QRCode.toDataURL(
      `wxp://mock-eztravel-pay/${order.orderRef}/${order.amountUsd.toFixed(2)}`,
      { width: 280, margin: 2, color: { dark: "#000000", light: "#ffffff" } }
    );
  }

  return NextResponse.json({
    orderRef: order.orderRef,
    status: order.status,
    paymentMethod: order.paymentMethod,
    amountUsd: order.amountUsd,
    days: order.days,
    email: order.email,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    plan: {
      name: order.plan.name,
      region: order.plan.region,
      dataType: order.plan.dataType,
      gb: order.plan.gb,
      validityDays: order.plan.validityDays,
    },
    paymentQrDataUrl,
    esim:
      order.status === "DELIVERED"
        ? {
            iccid: order.esimIccid,
            activationCode: order.esimActivation,
            smdpAddress: order.esimSmdp,
            qrDataUrl,
          }
        : null,
  });
}
