import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { hashPassword } from "@/lib/partner/password";
import { stateFromZip } from "@/lib/tax/us-state-rates";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
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
      role: true,
      balanceUsd: true,
      brandAlias: true,
      brandName: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ partners });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
    companyName?: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactPhone?: string;
    storeZip?: string;
    brandAlias?: string;
    openingBalance?: number;
  } | null;

  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  const companyName = body?.companyName?.trim() || "";
  const storeZip = body?.storeZip?.trim() || "";
  if (!email || !password || !companyName || !storeZip) {
    return NextResponse.json(
      { error: "email, password, companyName, storeZip required" },
      { status: 400 },
    );
  }

  const existing = await prisma.partner.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  let brandAlias = (body?.brandAlias || slugify(companyName) || "partner").toLowerCase();
  let i = 1;
  while (await prisma.partner.findUnique({ where: { brandAlias } })) {
    brandAlias = `${slugify(companyName)}-${i++}`;
  }

  const partner = await prisma.partner.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      companyName,
      contactFirstName: body?.contactFirstName?.trim() || "Partner",
      contactLastName: body?.contactLastName?.trim() || "Admin",
      contactPhone: body?.contactPhone?.trim() || "",
      storeZip,
      storeState: stateFromZip(storeZip),
      balanceUsd: Number(body?.openingBalance) || 0,
      brandName: companyName,
      brandAlias,
      brandEmail: email,
      supportEmail: email,
    },
  });

  return NextResponse.json({
    partner: {
      id: partner.id,
      email: partner.email,
      companyName: partner.companyName,
      brandAlias: partner.brandAlias,
      balanceUsd: partner.balanceUsd,
    },
  });
}
