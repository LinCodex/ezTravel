import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { appOrigin } from "@/lib/app-url";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function POST(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    esimId?: string;
    orderId?: string;
    orderRef?: string;
  } | null;

  let esimId = body?.esimId || null;
  let orderId = body?.orderId || null;

  if (body?.orderRef && !orderId) {
    const order = await prisma.partnerOrder.findFirst({
      where: { orderRef: body.orderRef, partnerId: partner.id },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    orderId = order.id;
  }

  if (esimId) {
    const esim = await prisma.partnerEsim.findFirst({
      where: { id: esimId, partnerId: partner.id },
    });
    if (!esim) return NextResponse.json({ error: "eSIM not found" }, { status: 404 });
  }

  if (!esimId && !orderId) {
    return NextResponse.json({ error: "esimId or orderRef required" }, { status: 400 });
  }

  const token = randomBytes(12).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const link = await prisma.quickShareLink.create({
    data: {
      token,
      partnerId: partner.id,
      esimId,
      orderId,
      expiresAt,
    },
  });

  const url = `${appOrigin(req)}/p/${partner.brandAlias}/share/${link.token}`;
  return NextResponse.json({
    token: link.token,
    url,
    expiresAt: expiresAt.toISOString(),
  });
}
