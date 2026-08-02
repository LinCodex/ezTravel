import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { PartnersManager } from "./PartnersManager";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      companyName: true,
      contactFirstName: true,
      contactLastName: true,
      storeZip: true,
      storeState: true,
      status: true,
      balanceUsd: true,
      brandAlias: true,
      createdAt: true,
    },
  });

  return (
    <AdminShell>
      <PartnersManager
        initial={partners.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </AdminShell>
  );
}
