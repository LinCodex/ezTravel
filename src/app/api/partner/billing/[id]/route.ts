import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { action?: string } | null;

  if (body?.action !== "CANCEL") {
    return NextResponse.json({ error: "action must be CANCEL" }, { status: 400 });
  }

  const topup = await prisma.balanceTopUp.findFirst({
    where: { id, partnerId: partner.id },
  });
  if (!topup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (topup.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending top-up requests can be cancelled" },
      { status: 400 },
    );
  }

  const updated = await prisma.balanceTopUp.update({
    where: { id },
    data: {
      status: "CANCELLED",
      reviewedAt: new Date(),
      adminNote: "Cancelled by partner",
    },
  });

  return NextResponse.json({
    topup: {
      id: updated.id,
      invNumber: updated.invNumber,
      amountUsd: updated.amountUsd,
      paymentType: updated.paymentType,
      status: updated.status,
      adminNote: updated.adminNote,
      createdAt: updated.createdAt.toISOString(),
      reviewedAt: updated.reviewedAt?.toISOString() ?? null,
    },
  });
}
