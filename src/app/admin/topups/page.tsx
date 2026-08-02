import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { TopupsManager } from "./TopupsManager";

export const dynamic = "force-dynamic";

export default async function AdminTopupsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const topups = await prisma.balanceTopUp.findMany({
    include: {
      partner: { select: { companyName: true, email: true, brandAlias: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <AdminShell>
      <TopupsManager
        initial={topups.map((t) => ({
          id: t.id,
          invNumber: t.invNumber,
          amountUsd: t.amountUsd,
          paymentType: t.paymentType,
          status: t.status,
          adminNote: t.adminNote,
          createdAt: t.createdAt.toISOString(),
          partner: t.partner,
        }))}
      />
    </AdminShell>
  );
}
