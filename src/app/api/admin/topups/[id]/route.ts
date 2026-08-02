import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    action?: "APPROVE" | "REJECT";
    adminNote?: string;
  } | null;

  const topup = await prisma.balanceTopUp.findUnique({ where: { id } });
  if (!topup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (topup.status !== "PENDING") {
    return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
  }

  if (body?.action === "APPROVE") {
    const [updated] = await prisma.$transaction([
      prisma.balanceTopUp.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote: body.adminNote?.trim() || "",
          reviewedAt: new Date(),
        },
      }),
      prisma.partner.update({
        where: { id: topup.partnerId },
        data: { balanceUsd: { increment: topup.amountUsd } },
      }),
    ]);
    return NextResponse.json({ topup: updated });
  }

  if (body?.action === "REJECT") {
    const updated = await prisma.balanceTopUp.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNote: body.adminNote?.trim() || "",
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ topup: updated });
  }

  return NextResponse.json({ error: "action must be APPROVE or REJECT" }, { status: 400 });
}
