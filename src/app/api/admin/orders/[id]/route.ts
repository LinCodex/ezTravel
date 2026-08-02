import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { plan: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    order: {
      ...order,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
    },
  });
}

/** Edit customer email / admin note. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    wechatId?: string | null;
    adminNote?: string;
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const email = body.email?.trim().toLowerCase();
  if (body.email !== undefined && (!email || !email.includes("@"))) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(email ? { email } : {}),
      ...(body.wechatId !== undefined ? { wechatId: body.wechatId } : {}),
      ...(body.adminNote !== undefined ? { adminNote: body.adminNote } : {}),
    },
  });
  return NextResponse.json({ ok: true, email: updated.email });
}
