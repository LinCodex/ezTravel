import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { balanceQuery, isMockProvisioning } from "@/lib/esim/access-client";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [consumerOrders, partnerOrders, pendingConfirm, failed, pendingTopups, supplier] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: since }, status: { in: ["DELIVERED", "PAID"] } },
        select: { amountUsd: true, createdAt: true, status: true },
      }),
      prisma.partnerOrder.findMany({
        where: { createdAt: { gte: since }, status: { in: ["DELIVERED", "COMPLETED", "PROCESSING"] } },
        select: { totalUsd: true, createdAt: true },
      }),
      prisma.order.count({ where: { status: "AWAITING_CONFIRMATION" } }),
      prisma.order.count({ where: { status: "FAILED" } }),
      prisma.balanceTopUp.count({ where: { status: "PENDING" } }),
      balanceQuery().catch(() => ({ balance: 0 })),
    ]);

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const seriesMap = new Map<string, { day: string; consumer: number; partner: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = dayKey(d);
    seriesMap.set(key, { day: key, consumer: 0, partner: 0 });
  }
  for (const o of consumerOrders) {
    const key = dayKey(o.createdAt);
    const row = seriesMap.get(key);
    if (row) row.consumer += o.amountUsd;
  }
  for (const o of partnerOrders) {
    const key = dayKey(o.createdAt);
    const row = seriesMap.get(key);
    if (row) row.partner += o.totalUsd;
  }

  const consumerRevenue = consumerOrders.reduce((s, o) => s + o.amountUsd, 0);
  const partnerRevenue = partnerOrders.reduce((s, o) => s + o.totalUsd, 0);

  return NextResponse.json({
    revenue: {
      consumer: consumerRevenue,
      partner: partnerRevenue,
      total: consumerRevenue + partnerRevenue,
    },
    pending: {
      awaitingConfirmation: pendingConfirm,
      failedProvisions: failed,
      pendingTopups,
    },
    supplierBalance: supplier.balance,
    mockProvisioning: isMockProvisioning(),
    series: [...seriesMap.values()],
  });
}
