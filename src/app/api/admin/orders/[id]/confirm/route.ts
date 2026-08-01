import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { provisionOrder } from "@/lib/esim/provision";

/** Admin manually confirms a Zelle/WeChat payment; provisions the eSIM. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!["AWAITING_CONFIRMATION", "AWAITING_PAYMENT"].includes(order.status)) {
    return NextResponse.json({ error: "invalid order state" }, { status: 409 });
  }

  // Confirming one line in a cart checkout confirms the whole cart payment.
  const siblings = order.cartGroup
    ? await prisma.order.findMany({
        where: {
          cartGroup: order.cartGroup,
          status: { in: ["AWAITING_CONFIRMATION", "AWAITING_PAYMENT"] },
        },
      })
    : [order];

  let updated = order;
  for (const sibling of siblings) {
    updated = await provisionOrder(sibling.id);
  }

  return NextResponse.json({ ok: true, status: updated.status, count: siblings.length });
}
