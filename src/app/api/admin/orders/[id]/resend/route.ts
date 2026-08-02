import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { sendConsumerDeliveryEmail } from "@/lib/email";

export async function POST(
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
  if (order.status !== "DELIVERED" || !order.esimActivation) {
    return NextResponse.json({ error: "Order not delivered yet" }, { status: 409 });
  }

  const result = await sendConsumerDeliveryEmail({
    to: order.email,
    orderRef: order.orderRef,
    planName: order.plan.name,
    activationCode: order.esimActivation,
    iccid: order.esimIccid,
  });
  if (!result.ok) {
    return NextResponse.json({ error: "Email send failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, skipped: result.skipped ?? false });
}
