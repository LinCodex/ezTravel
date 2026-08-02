import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";
import {
  coverageBucket,
  dataLabel,
  partnerUnitPrice,
  suggestedRetail,
} from "@/lib/partner/pricing";
import { prismaTextSearch } from "@/lib/partner/search";

export async function GET(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const coverage = searchParams.get("coverage") || "";
  const minGb = Number(searchParams.get("minGb") || 0);
  const maxGb = Number(searchParams.get("maxGb") || 0);
  const minDays = Number(searchParams.get("minDays") || 0);
  const maxDays = Number(searchParams.get("maxDays") || 0);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const region = searchParams.get("region") || "";

  const where: Record<string, unknown> = { visible: true };
  if (region) where.region = region;
  if (minGb > 0 || maxGb > 0) {
    where.gb = {
      ...(minGb > 0 ? { gte: minGb } : {}),
      ...(maxGb > 0 ? { lte: maxGb } : {}),
    };
  }
  if (minDays > 0 || maxDays > 0) {
    where.validityDays = {
      ...(minDays > 0 ? { gte: minDays } : {}),
      ...(maxDays > 0 ? { lte: maxDays } : {}),
    };
  }
  if (q) {
    // Prefix-first + contains; SQLite LIKE is case-insensitive for ASCII
    where.OR = prismaTextSearch(["region", "name", "regionCode", "networks", "id"], q);
  }

  // Slim columns only; pricing is computed just for the returned page.
  const plans = await prisma.plan.findMany({
    where,
    orderBy: [{ region: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      region: true,
      regionSlug: true,
      regionCode: true,
      dataType: true,
      gb: true,
      validityDays: true,
      networks: true,
      coverage: true,
      speed: true,
      fupPolicy: true,
      topUpType: true,
      costUsd: true,
    },
  });

  // Coverage bucket derives from type+region text, so classify after the DB filter.
  const filtered =
    coverage === "country" || coverage === "regional" || coverage === "global"
      ? plans.filter((p) => coverageBucket(p.type, p.region) === coverage)
      : plans;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((p) => {
    const priced = partnerUnitPrice(p.costUsd, partner.storeZip);
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      region: p.region,
      regionSlug: p.regionSlug,
      regionCode: p.regionCode,
      dataType: p.dataType,
      gb: p.gb,
      dataLabel: dataLabel(p.gb, p.dataType),
      validityDays: p.validityDays,
      networks: p.networks,
      coverage: p.coverage || p.region,
      coverageBucket: coverageBucket(p.type, p.region),
      speed: p.speed,
      fupPolicy: p.fupPolicy,
      topUpType: p.topUpType,
      wholesale: priced.wholesale,
      tax: priced.tax,
      price: priced.total,
      suggestedRetail: suggestedRetail(priced.total, partner.retailMarkupPercent),
      taxState: priced.state,
      taxRate: priced.rate,
    };
  });

  const [recentRegions, regionRows] = await Promise.all([
    prisma.partnerEsim.groupBy({
      by: ["region"],
      where: { partnerId: partner.id },
      _count: { region: true },
      orderBy: { _count: { region: "desc" } },
      take: 8,
    }),
    prisma.plan.findMany({
      where: { visible: true },
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    recentLocations: recentRegions.map((r) => r.region).filter(Boolean),
    regions: regionRows.map((r) => r.region),
    markupPercent: partner.retailMarkupPercent,
  });
}
