import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { computeSellPrice } from "@/lib/pricing";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return NextResponse.json({ error: "not found" }, { status: 404 });

  const data: { name?: string; region?: string; priceUsd?: number; priceOverridden?: boolean; visible?: boolean } = {};

  if (typeof body.visible === "boolean") data.visible = body.visible;
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.region === "string" && body.region.trim()) data.region = body.region.trim();

  if (body.resetPrice === true) {
    data.priceUsd = computeSellPrice(plan.costUsd);
    data.priceOverridden = false;
  } else if (typeof body.priceUsd === "number") {
    if (!Number.isFinite(body.priceUsd) || body.priceUsd <= 0) {
      return NextResponse.json({ error: "invalid price" }, { status: 400 });
    }
    data.priceUsd = Math.round(body.priceUsd * 100) / 100;
    data.priceOverridden = true;
  }

  const updated = await prisma.plan.update({ where: { id }, data });
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    region: updated.region,
    priceUsd: updated.priceUsd,
    priceOverridden: updated.priceOverridden,
    visible: updated.visible,
  });
}
