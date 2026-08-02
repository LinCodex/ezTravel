import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";
import { prismaTextSearch } from "@/lib/partner/search";

export async function GET(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "";
  const refunded = searchParams.get("refunded");
  const pendingActivation = searchParams.get("pendingActivation");
  const expiresInDays = Number(searchParams.get("expiresInDays") || 0);
  const dataRemaining = searchParams.get("dataRemaining"); // low | any
  const archived = searchParams.get("archived") === "1";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get("pageSize") || 12)));

  const where: Record<string, unknown> = {
    partnerId: partner.id,
    archived,
  };

  if (q) {
    where.OR = prismaTextSearch(
      ["iccid", "assignee", "nickname", "planName", "region", "notes"],
      q,
    );
  }
  if (status) where.status = status;
  if (refunded === "1") where.refunded = true;
  if (pendingActivation === "1") where.status = "PENDING_ACTIVATION";
  if (expiresInDays > 0) {
    const until = new Date();
    until.setDate(until.getDate() + expiresInDays);
    where.expiresAt = { lte: until, gte: new Date() };
  }
  if (dataRemaining === "low") {
    where.dataRemainingGb = { lte: 1 };
  }

  const [total, items, archivedCount] = await Promise.all([
    prisma.partnerEsim.count({ where }),
    prisma.partnerEsim.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        planId: true,
        planName: true,
        region: true,
        regionCode: true,
        dataLabel: true,
        validityDays: true,
        status: true,
        iccid: true,
        assignee: true,
        nickname: true,
        networks: true,
        notes: true,
        unitPaidUsd: true,
        dataRemainingGb: true,
        refunded: true,
        archived: true,
        issuedAt: true,
        activatedAt: true,
        expiresAt: true,
        activationCode: true,
        smdpAddress: true,
      },
    }),
    prisma.partnerEsim.count({ where: { partnerId: partner.id, archived: true } }),
  ]);

  // Backfill flags for older eSIMs that predate regionCode persistence.
  const missingCodes = items.filter((e) => !e.regionCode && e.planId);
  const planCodes = missingCodes.length
    ? await prisma.plan.findMany({
        where: { id: { in: [...new Set(missingCodes.map((e) => e.planId))] } },
        select: { id: true, regionCode: true },
      })
    : [];
  const codeByPlan = new Map(planCodes.map((p) => [p.id, p.regionCode || ""]));

  return NextResponse.json({
    total,
    page,
    pageSize,
    archivedCount,
    items: items.map((e) => ({
      ...e,
      regionCode: e.regionCode || codeByPlan.get(e.planId) || "",
      issuedAt: e.issuedAt.toISOString(),
      activatedAt: e.activatedAt?.toISOString() ?? null,
      expiresAt: e.expiresAt?.toISOString() ?? null,
    })),
  });
}

export async function PATCH(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    nickname?: string;
    assignee?: string;
    notes?: string;
    archived?: boolean;
  } | null;
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.partnerEsim.findFirst({
    where: { id: body.id, partnerId: partner.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.partnerEsim.update({
    where: { id: body.id },
    data: {
      nickname: body.nickname ?? existing.nickname,
      assignee: body.assignee ?? existing.assignee,
      notes: body.notes ?? existing.notes,
      ...(typeof body.archived === "boolean" ? { archived: body.archived } : {}),
    },
  });
  return NextResponse.json({ esim: updated });
}
