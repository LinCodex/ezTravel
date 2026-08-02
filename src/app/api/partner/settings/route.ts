import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner, publicPartner } from "@/lib/partner/auth";

export async function GET() {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ partner: publicPartner(partner) });
}

export async function PATCH(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    retailMarkupPercent?: number;
    brandName?: string;
    brandAlias?: string;
    brandUrl?: string;
    brandEmail?: string;
    brandLogoUrl?: string;
    brandIconUrl?: string;
    brandHeroUrl?: string;
    brandColor?: string;
    supportEmail?: string;
    supportPhone?: string;
  } | null;

  const data: Record<string, unknown> = {};
  if (typeof body?.retailMarkupPercent === "number") {
    data.retailMarkupPercent = Math.max(0, Math.min(500, body.retailMarkupPercent));
  }

  const brandFields = [
    "brandName",
    "brandAlias",
    "brandUrl",
    "brandEmail",
    "brandLogoUrl",
    "brandIconUrl",
    "brandHeroUrl",
    "brandColor",
    "supportEmail",
    "supportPhone",
  ] as const;

  for (const key of brandFields) {
    if (typeof body?.[key] === "string") {
      data[key] = body[key]!.trim();
    }
  }

  if (typeof data.brandAlias === "string") {
    const alias = (data.brandAlias as string).toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!alias) return NextResponse.json({ error: "Invalid brand alias" }, { status: 400 });
    const clash = await prisma.partner.findFirst({
      where: { brandAlias: alias, NOT: { id: partner.id } },
    });
    if (clash) return NextResponse.json({ error: "Brand alias already taken" }, { status: 409 });
    data.brandAlias = alias;
  }

  const updated = await prisma.partner.update({
    where: { id: partner.id },
    data,
  });

  return NextResponse.json({ partner: publicPartner(updated) });
}
