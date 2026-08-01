import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";

function aggregateStatus(statuses: string[]) {
  const set = new Set(statuses);
  if (set.has("AWAITING_PAYMENT")) return "AWAITING_PAYMENT";
  if (set.has("AWAITING_CONFIRMATION")) return "AWAITING_CONFIRMATION";
  if (set.size === 1 && set.has("CANCELLED")) return "CANCELLED";
  if (statuses.every((s) => s === "DELIVERED")) return "DELIVERED";
  return statuses[0] ?? "AWAITING_PAYMENT";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const { group } = await params;
  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { cartGroup: group.toUpperCase(), email },
    include: { plan: true },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const primary = orders[0];
  const totalUsd =
    Math.round(orders.reduce((sum, o) => sum + o.amountUsd, 0) * 100) / 100;
  const status = aggregateStatus(orders.map((o) => o.status));

  let paymentQrDataUrl: string | null = null;
  if (primary.paymentMethod === "WECHAT" && status === "AWAITING_CONFIRMATION") {
    paymentQrDataUrl = await QRCode.toDataURL(
      `wxp://mock-eztravel-pay/${primary.cartGroup}/${totalUsd.toFixed(2)}`,
      { width: 280, margin: 2, color: { dark: "#000000", light: "#ffffff" } }
    );
  }

  const items = await Promise.all(
    orders.map(async (order) => {
      let esimQr: string | null = null;
      if (order.status === "DELIVERED" && order.esimActivation) {
        esimQr = await QRCode.toDataURL(order.esimActivation, {
          width: 280,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
      }
      return {
        orderRef: order.orderRef,
        status: order.status,
        amountUsd: order.amountUsd,
        days: order.days,
        plan: {
          name: order.plan.name,
          region: order.plan.region,
          dataType: order.plan.dataType,
          gb: order.plan.gb,
          validityDays: order.plan.validityDays,
        },
        esim:
          order.status === "DELIVERED"
            ? {
                iccid: order.esimIccid,
                activationCode: order.esimActivation,
                smdpAddress: order.esimSmdp,
                qrDataUrl: esimQr,
              }
            : null,
      };
    })
  );

  return NextResponse.json({
    cartGroup: primary.cartGroup,
    status,
    paymentMethod: primary.paymentMethod,
    totalUsd,
    email: primary.email,
    createdAt: primary.createdAt.toISOString(),
    paymentQrDataUrl,
    orderRefs: orders.map((o) => o.orderRef),
    items,
  });
}
