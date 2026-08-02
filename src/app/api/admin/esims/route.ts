import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { usageQuery } from "@/lib/esim/access-client";
import { dbSetupHint, isDbConnectivityError } from "@/lib/partner/ensure-demo";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const source = searchParams.get("source") || "all"; // all | consumer | partner
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 25)));

  const consumerRows =
    source === "partner"
      ? []
      : await prisma.order.findMany({
          where: {
            OR: [
              { esimIccid: { not: null } },
              { esimActivation: { not: null } },
              { status: { in: ["DELIVERED", "FAILED", "REFUNDED", "PAID"] } },
            ],
          },
          include: { plan: { select: { name: true, region: true, gb: true } } },
          orderBy: { createdAt: "desc" },
          take: 500,
        });

  const partnerRows =
    source === "consumer"
      ? []
      : await prisma.partnerEsim.findMany({
          include: {
            partner: { select: { companyName: true, brandName: true, email: true } },
          },
          orderBy: { issuedAt: "desc" },
          take: 500,
        });

  type Row = {
    id: string;
    source: "consumer" | "partner";
    label: string;
    region: string;
    email: string;
    partnerName: string | null;
    status: string;
    iccid: string | null;
    esimTranNo: string | null;
    activationCode: string | null;
    dataRemainingGb: number | null;
    planGb: number | null;
    createdAt: string;
  };

  let rows: Row[] = [
    ...consumerRows.map((o) => ({
      id: o.id,
      source: "consumer" as const,
      label: o.plan.name,
      region: o.plan.region,
      email: o.email,
      partnerName: null,
      status: o.status,
      iccid: o.esimIccid,
      esimTranNo: o.esimTranNo,
      activationCode: o.esimActivation,
      dataRemainingGb: null as number | null,
      planGb: o.plan.gb,
      createdAt: o.createdAt.toISOString(),
    })),
    ...partnerRows.map((e) => ({
      id: e.id,
      source: "partner" as const,
      label: e.planName || e.region,
      region: e.region,
      email: e.partner.email,
      partnerName: e.partner.brandName || e.partner.companyName,
      status: e.refunded ? "REFUNDED" : e.status,
      iccid: e.iccid,
      esimTranNo: e.esimTranNo,
      activationCode: e.activationCode,
      dataRemainingGb: e.dataRemainingGb,
      planGb: null as number | null,
      createdAt: e.issuedAt.toISOString(),
    })),
  ];

  if (q) {
    rows = rows.filter(
      (r) =>
        r.iccid?.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.partnerName?.toLowerCase().includes(q) ||
        r.esimTranNo?.toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  // Attach mock/live usage for the visible page.
  const withUsage = await Promise.all(
    pageRows.map(async (r) => {
      if (!r.esimTranNo && !r.iccid) return r;
      try {
        const usage = await usageQuery({
          esimTranNo: r.esimTranNo || undefined,
          iccid: r.iccid || undefined,
          planGb: r.planGb || undefined,
        });
        return {
          ...r,
          dataRemainingGb: usage?.remainingGb ?? r.dataRemainingGb,
          usedGb: usage?.usedGb ?? null,
          totalGb: usage?.totalGb ?? r.planGb,
        };
      } catch {
        return r;
      }
    }),
  );

  return NextResponse.json({ total, page, pageSize, items: withUsage });
  } catch (err) {
    console.error("[admin/esims]", err);
    return NextResponse.json(
      { error: isDbConnectivityError(err) ? dbSetupHint() : "Failed to load eSIMs", items: [], total: 0 },
      { status: isDbConnectivityError(err) ? 503 : 500 },
    );
  }
}
