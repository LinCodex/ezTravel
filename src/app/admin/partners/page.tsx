import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { dbSetupHint, isDbConnectivityError } from "@/lib/partner/ensure-demo";
import { AdminShell } from "../AdminShell";
import { PartnersManager } from "./PartnersManager";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  try {
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
  } catch (err) {
    console.error("[admin/partners]", err);
    const message = isDbConnectivityError(err)
      ? dbSetupHint()
      : err instanceof Error
        ? err.message
        : "Failed to load partners";
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-semibold text-red-100">Partners unavailable</p>
          <p className="mt-2 leading-relaxed">{message}</p>
        </div>
      </AdminShell>
    );
  }
}
