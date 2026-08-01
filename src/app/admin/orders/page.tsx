import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { OrdersTable, type AdminOrder } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    include: { plan: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows: AdminOrder[] = orders.map((o) => ({
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
    createdAt: o.createdAt.toISOString(),
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
  }));

  return (
    <AdminShell>
      <OrdersTable orders={rows} />
    </AdminShell>
  );
}
