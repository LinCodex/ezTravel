import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const topups = await prisma.balanceTopUp.findMany({
    where: status ? { status } : undefined,
    include: {
      partner: { select: { companyName: true, email: true, brandAlias: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json({ topups });
}
