import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { dbSetupHint, isDbConnectivityError } from "@/lib/partner/ensure-demo";
import { AdminShell } from "../../AdminShell";
import { PartnerDetailManager } from "./PartnerDetailManager";

export const dynamic = "force-dynamic";

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;

  try {
    const partner = await prisma.partner.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        companyName: true,
        contactFirstName: true,
        contactLastName: true,
        contactPhone: true,
        storeZip: true,
        storeState: true,
        status: true,
        balanceUsd: true,
        retailMarkupPercent: true,
        brandName: true,
        brandAlias: true,
        brandColor: true,
        adminNotes: true,
        createdAt: true,
      },
    });
    if (!partner) notFound();

    const [orders, topups, esims, quickShares, esimCount, esimActive] = await Promise.all([
      prisma.partnerOrder.findMany({
        where: { partnerId: id },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          orderRef: true,
          status: true,
          quantity: true,
          totalUsd: true,
          createdAt: true,
        },
      }),
      prisma.balanceTopUp.findMany({
        where: { partnerId: id },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          invNumber: true,
          amountUsd: true,
          paymentType: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.partnerEsim.findMany({
        where: { partnerId: id },
        orderBy: { issuedAt: "desc" },
        take: 100,
        select: {
          id: true,
          planName: true,
          region: true,
          status: true,
          iccid: true,
          esimTranNo: true,
          nickname: true,
          dataRemainingGb: true,
          issuedAt: true,
        },
      }),
      prisma.quickShareLink.findMany({
        where: { partnerId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          token: true,
          createdAt: true,
          expiresAt: true,
          esim: { select: { planName: true, iccid: true } },
          order: { select: { orderRef: true } },
        },
      }),
      prisma.partnerEsim.count({ where: { partnerId: id } }),
      prisma.partnerEsim.count({ where: { partnerId: id, status: "ACTIVE" } }),
    ]);

    return (
      <AdminShell>
        <div className="mx-auto max-w-6xl space-y-6">
          <Link href="/admin/partners" className="text-sm text-white/50 hover:text-white">
            ← All partners
          </Link>
          <PartnerDetailManager
            partner={{
              ...partner,
              createdAt: partner.createdAt.toISOString(),
            }}
            esimCount={esimCount}
            esimActive={esimActive}
            orders={orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }))}
            topups={topups.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))}
            esims={esims.map((e) => ({
              ...e,
              issuedAt: e.issuedAt.toISOString(),
            }))}
            quickShares={quickShares.map((q) => ({
              id: q.id,
              token: q.token,
              createdAt: q.createdAt.toISOString(),
              expiresAt: q.expiresAt?.toISOString() ?? null,
              target: q.order?.orderRef || q.esim?.planName || q.esim?.iccid || "—",
              url: `/p/${partner.brandAlias}/share/${q.token}`,
            }))}
          />
        </div>
      </AdminShell>
    );
  } catch (err) {
    console.error("[admin/partners/id]", err);
    const digest =
      typeof err === "object" && err && "digest" in err
        ? String((err as { digest?: unknown }).digest || "")
        : "";
    // notFound() / redirect() use NEXT_* digests — rethrow so Next can handle them.
    if (digest.startsWith("NEXT_")) throw err;
    const message = isDbConnectivityError(err)
      ? dbSetupHint()
      : err instanceof Error
        ? err.message
        : "Failed to load partner";
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl space-y-4">
          <Link href="/admin/partners" className="text-sm text-white/50 hover:text-white">
            ← All partners
          </Link>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            <p className="font-semibold text-red-100">Partner detail unavailable</p>
            <p className="mt-2 leading-relaxed">{message}</p>
          </div>
        </div>
      </AdminShell>
    );
  }
}
