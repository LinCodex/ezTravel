import { sendConsumerDeliveryEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { orderEsimProfile } from "./access-client";

/**
 * Marks an order as paid, orders the eSIM profile from the supplier,
 * and stores the activation details. Used by the mock Square payment,
 * the admin manual-confirmation flow, and the admin "retry provision"
 * action (orders land in FAILED instead of getting stuck when the
 * supplier call throws).
 */
export async function provisionOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { plan: true },
  });

  // Payment confirmed before supplier call so the state machine is honest.
  if (order.status !== "PAID" && order.status !== "DELIVERED") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paidAt: order.paidAt ?? new Date() },
    });
  }

  const isDaily = order.plan.dataType === "Daily Unlimited";
  let profile;
  try {
    profile = await orderEsimProfile({
      packageCode: order.planId,
      periodNum: isDaily ? order.days : undefined,
      transactionId: order.orderRef,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Supplier order failed";
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "FAILED",
        paidAt: order.paidAt ?? new Date(),
        failureReason: reason.slice(0, 500),
      },
    });
    throw err;
  }

  const now = new Date();
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DELIVERED",
      paidAt: order.paidAt ?? now,
      deliveredAt: now,
      supplierOrderNo: profile.supplierOrderNo,
      esimTranNo: profile.esimTranNo || null,
      esimIccid: profile.iccid,
      esimActivation: profile.activationCode,
      esimSmdp: profile.smdpAddress,
      failureReason: null,
    },
    include: { plan: true },
  });

  // Fire-and-forget delivery email (logs to console when Resend is absent).
  void sendConsumerDeliveryEmail({
    to: updated.email,
    orderRef: updated.orderRef,
    planName: updated.plan.name,
    activationCode: updated.esimActivation,
    iccid: updated.esimIccid,
  }).catch(() => undefined);

  return updated;
}
