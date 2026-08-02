import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 25)));

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }
  if (q) {
    where.OR = [
      { orderRef: { contains: q } },
      { email: { contains: q } },
      { wechatId: { contains: q } },
      { esimIccid: { contains: q } },
      { esimTranNo: { contains: q } },
      { supplierOrderNo: { contains: q } },
      { plan: { name: { contains: q } } },
      { plan: { region: { contains: q } } },
    ];
  }

  const [total, items, statusCounts, revenue] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        plan: { select: { name: true, region: true, dataType: true, gb: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "PAID"] } },
      _sum: { amountUsd: true },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const row of statusCounts) counts[row.status] = row._count._all;

  return NextResponse.json({
    total,
    page,
    pageSize,
    counts,
    stats: {
      revenueUsd: revenue._sum.amountUsd || 0,
      deliveredCount: counts.DELIVERED || 0,
      pendingCount: counts.AWAITING_CONFIRMATION || 0,
      failedCount: counts.FAILED || 0,
      awaitingPaymentCount: counts.AWAITING_PAYMENT || 0,
      customers: await prisma.order
        .findMany({ select: { email: true }, distinct: ["email"] })
        .then((r) => r.length),
    },
    items: items.map((o) => ({
      id: o.id,
      orderRef: o.orderRef,
      planName: o.plan.name,
      region: o.plan.region,
      dataType: o.plan.dataType,
      days: o.days,
      email: o.email,
      wechatId: o.wechatId,
      paymentMethod: o.paymentMethod,
      amountUsd: o.amountUsd,
      status: o.status,
      failureReason: o.failureReason,
      esimIccid: o.esimIccid,
      esimActivation: o.esimActivation,
      esimSmdp: o.esimSmdp,
      supplierOrderNo: o.supplierOrderNo,
      esimTranNo: o.esimTranNo,
      adminNote: o.adminNote,
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString() ?? null,
      deliveredAt: o.deliveredAt?.toISOString() ?? null,
    })),
  });
}
