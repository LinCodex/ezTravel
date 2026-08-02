import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { dbSetupHint, isDbConnectivityError } from "@/lib/partner/ensure-demo";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const orders = await prisma.order.findMany({
    select: {
      email: true,
      wechatId: true,
      amountUsd: true,
      status: true,
      createdAt: true,
      orderRef: true,
    },
    orderBy: { createdAt: "desc" },
  });

  type Agg = {
    email: string;
    wechatId: string | null;
    orderCount: number;
    lifetimeValue: number;
    lastOrderAt: string;
    lastOrderRef: string;
    deliveredCount: number;
  };

  const map = new Map<string, Agg>();
  for (const o of orders) {
    const key = o.email.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: o.email,
        wechatId: o.wechatId,
        orderCount: 1,
        lifetimeValue: ["DELIVERED", "PAID"].includes(o.status) ? o.amountUsd : 0,
        lastOrderAt: o.createdAt.toISOString(),
        lastOrderRef: o.orderRef,
        deliveredCount: o.status === "DELIVERED" ? 1 : 0,
      });
    } else {
      existing.orderCount += 1;
      if (["DELIVERED", "PAID"].includes(o.status)) existing.lifetimeValue += o.amountUsd;
      if (o.status === "DELIVERED") existing.deliveredCount += 1;
      if (!existing.wechatId && o.wechatId) existing.wechatId = o.wechatId;
    }
  }

  let customers = [...map.values()].sort(
    (a, b) => b.lifetimeValue - a.lifetimeValue || b.lastOrderAt.localeCompare(a.lastOrderAt),
  );
  if (q) {
    customers = customers.filter(
      (c) => c.email.toLowerCase().includes(q) || c.wechatId?.toLowerCase().includes(q),
    );
  }

  return NextResponse.json({ total: customers.length, customers });
  } catch (err) {
    console.error("[admin/customers]", err);
    return NextResponse.json(
      {
        error: isDbConnectivityError(err) ? dbSetupHint() : "Failed to load customers",
        customers: [],
        total: 0,
      },
      { status: isDbConnectivityError(err) ? 503 : 500 },
    );
  }
}
