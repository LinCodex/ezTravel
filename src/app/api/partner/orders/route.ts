import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function GET(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const packageType = searchParams.get("packageType") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { partnerId: partner.id };
  if (status) where.status = status;
  if (packageType) where.packageType = packageType;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const orders = await prisma.partnerOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      orderRef: true,
      quantity: true,
      status: true,
      createdAt: true,
      orderedBy: true,
      totalUsd: true,
      subtotalUsd: true,
      taxUsd: true,
      packageType: true,
    },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderRef: o.orderRef,
      quantity: o.quantity,
      status: o.status,
      date: o.createdAt.toISOString(),
      orderedBy: o.orderedBy,
      orderTotal: o.totalUsd,
      subtotalUsd: o.subtotalUsd,
      taxUsd: o.taxUsd,
      packageType: o.packageType,
      deliveryPath: `/p/${partner.brandAlias}/order/${o.orderRef}`,
    })),
  });
}
