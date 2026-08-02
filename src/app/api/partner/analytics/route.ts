import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";
import { suggestedRetail } from "@/lib/partner/pricing";
import { roundMoney } from "@/lib/tax/us-state-rates";

export async function GET() {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partnerWhere = { partnerId: partner.id };

  const [
    esimAgg,
    esimStatusGroups,
    refundedCount,
    assignedCount,
    orderStatusGroups,
    deliveredOrders,
    regions,
    planGroups,
  ] = await Promise.all([
    prisma.partnerEsim.aggregate({
      where: partnerWhere,
      _count: { _all: true },
      _sum: { unitPaidUsd: true },
    }),
    prisma.partnerEsim.groupBy({
      by: ["status"],
      where: partnerWhere,
      _count: { status: true },
    }),
    prisma.partnerEsim.count({
      where: { ...partnerWhere, OR: [{ refunded: true }, { status: "REFUNDED" }] },
    }),
    prisma.partnerEsim.count({
      where: {
        ...partnerWhere,
        OR: [{ NOT: { assignee: "" } }, { NOT: { nickname: "" } }],
      },
    }),
    prisma.partnerOrder.groupBy({
      by: ["status"],
      where: partnerWhere,
      _count: { status: true },
    }),
    // Slim rows just for the monthly series (dates + qty + totals)
    prisma.partnerOrder.findMany({
      where: { ...partnerWhere, status: "DELIVERED" },
      orderBy: { createdAt: "asc" },
      take: 2000,
      select: { createdAt: true, quantity: true, totalUsd: true },
    }),
    prisma.partnerEsim.groupBy({
      by: ["region"],
      where: partnerWhere,
      _count: { region: true },
      orderBy: { _count: { region: "desc" } },
      take: 12,
    }),
    prisma.partnerEsim.groupBy({
      by: ["planName"],
      where: partnerWhere,
      _count: { planName: true },
      orderBy: { _count: { planName: "desc" } },
      take: 5,
    }),
  ]);

  const sold = esimAgg._count._all;
  const spend = roundMoney(esimAgg._sum.unitPaidUsd || 0);
  const estimatedRetail = roundMoney(
    suggestedRetail(spend, partner.retailMarkupPercent),
  );
  const estimatedProfit = roundMoney(estimatedRetail - spend);

  const esimStatus = new Map(esimStatusGroups.map((g) => [g.status, g._count.status]));
  const pendingActivation = esimStatus.get("PENDING_ACTIVATION") || 0;
  const active = esimStatus.get("ACTIVE") || 0;
  const expired = esimStatus.get("EXPIRED") || 0;

  const orderStatus = new Map(orderStatusGroups.map((g) => [g.status, g._count.status]));
  const orderCount = orderStatusGroups.reduce((s, g) => s + g._count.status, 0);
  const deliveredCount = orderStatus.get("DELIVERED") || 0;
  const failedOrders = orderStatus.get("FAILED") || 0;

  const deliveredTotal = deliveredOrders.reduce((s, o) => s + o.totalUsd, 0);
  const avgOrderValue = deliveredCount
    ? roundMoney(deliveredTotal / deliveredCount)
    : 0;
  const avgUnitCost = sold ? roundMoney(spend / sold) : 0;
  const marginPercent = spend > 0 ? roundMoney((estimatedProfit / spend) * 100) : 0;

  const byMonthMap = new Map<string, { sold: number; spend: number }>();
  for (const o of deliveredOrders) {
    const key = o.createdAt.toISOString().slice(0, 7);
    const cur = byMonthMap.get(key) || { sold: 0, spend: 0 };
    cur.sold += o.quantity;
    cur.spend += o.totalUsd;
    byMonthMap.set(key, cur);
  }
  const byMonth = Array.from(byMonthMap.entries()).map(([month, v]) => ({
    month,
    sold: v.sold,
    spend: roundMoney(v.spend),
    estimatedProfit: roundMoney(
      suggestedRetail(v.spend, partner.retailMarkupPercent) - v.spend,
    ),
  }));

  return NextResponse.json({
    summary: {
      sold,
      spend,
      estimatedRetail,
      estimatedProfit,
      markupPercent: partner.retailMarkupPercent,
      balanceUsd: partner.balanceUsd,
      pendingActivation,
      active,
      expired,
      refunded: refundedCount,
      assigned: assignedCount,
      unassigned: Math.max(0, sold - assignedCount),
      orderCount,
      deliveredOrders: deliveredCount,
      failedOrders,
      avgOrderValue,
      avgUnitCost,
      marginPercent,
      topPlan: planGroups[0]?.planName || "—",
      topPlanCount: planGroups[0]?._count.planName || 0,
    },
    byMonth,
    regions: regions.map((r) => ({ region: r.region || "Unknown", count: r._count.region })),
    topPlans: planGroups.map((p) => ({
      planName: p.planName || "Unknown",
      count: p._count.planName,
    })),
  });
}
