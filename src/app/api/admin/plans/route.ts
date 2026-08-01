import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";

const PAGE_SIZE = 50;

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10) || 1, 1);

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { region: { contains: q } },
          { id: { contains: q } },
          { slug: { contains: q } },
        ],
      }
    : {};

  const [total, plans] = await Promise.all([
    prisma.plan.count({ where }),
    prisma.plan.findMany({
      where,
      orderBy: [{ region: "asc" }, { gb: "asc" }, { validityDays: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize: PAGE_SIZE,
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      dataType: p.dataType,
      gb: p.gb,
      validityDays: p.validityDays,
      costUsd: p.costUsd,
      priceUsd: p.priceUsd,
      priceOverridden: p.priceOverridden,
      visible: p.visible,
    })),
  });
}
