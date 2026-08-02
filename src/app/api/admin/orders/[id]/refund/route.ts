import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { cancelEsim } from "@/lib/esim/access-client";

/** Mark order REFUNDED and ask supplier to cancel unused profile. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status === "REFUNDED" || order.status === "CANCELLED") {
    return NextResponse.json({ error: "Already closed" }, { status: 409 });
  }

  if (order.esimTranNo || order.esimIccid) {
    try {
      await cancelEsim({
        esimTranNo: order.esimTranNo || undefined,
        iccid: order.esimIccid || undefined,
      });
    } catch (err) {
      // Still mark refunded locally; surface supplier message.
      const msg = err instanceof Error ? err.message : "cancel failed";
      await prisma.order.update({
        where: { id },
        data: {
          status: "REFUNDED",
          failureReason: `Refunded locally; supplier cancel: ${msg}`.slice(0, 500),
        },
      });
      return NextResponse.json({ ok: true, warning: msg });
    }
  }

  await prisma.order.update({
    where: { id },
    data: { status: "REFUNDED", failureReason: null },
  });
  return NextResponse.json({ ok: true });
}
