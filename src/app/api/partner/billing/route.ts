import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner, publicPartner } from "@/lib/partner/auth";
import { generateInvNumber } from "@/lib/utils";

export async function GET(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const paymentType = searchParams.get("paymentType") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { partnerId: partner.id };
  if (status) where.status = status;
  if (paymentType) where.paymentType = paymentType;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const topups = await prisma.balanceTopUp.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json({
    partner: publicPartner(partner),
    topups: topups.map((t) => ({
      id: t.id,
      invNumber: t.invNumber,
      amountUsd: t.amountUsd,
      paymentType: t.paymentType,
      status: t.status,
      adminNote: t.adminNote,
      createdAt: t.createdAt.toISOString(),
      reviewedAt: t.reviewedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    amountUsd?: number;
    paymentType?: string;
  } | null;

  const amountUsd = Number(body?.amountUsd);
  const paymentType = (body?.paymentType || "").toUpperCase();
  if (!amountUsd || amountUsd <= 0) {
    return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
  }
  if (!["ZELLE", "VENMO", "WECHAT", "CASH"].includes(paymentType)) {
    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  }

  let topup = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      topup = await prisma.balanceTopUp.create({
        data: {
          invNumber: generateInvNumber(),
          partnerId: partner.id,
          amountUsd,
          paymentType,
          status: "PENDING",
        },
      });
      break;
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code !== "P2002") throw err;
    }
  }
  if (!topup) {
    return NextResponse.json({ error: "Could not allocate invoice number" }, { status: 500 });
  }

  return NextResponse.json({
    topup: {
      id: topup.id,
      invNumber: topup.invNumber,
      amountUsd: topup.amountUsd,
      paymentType: topup.paymentType,
      status: topup.status,
      createdAt: topup.createdAt.toISOString(),
    },
  });
}
