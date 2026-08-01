import { prisma } from "@/lib/db";
import { orderEsimProfile } from "./mock-provider";

/**
 * Marks an order as paid, orders the eSIM profile from the (mock) supplier,
 * and stores the activation details. Used by both the mock Square payment
 * and the admin manual-confirmation flow.
 */
export async function provisionOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { plan: true },
  });

  const isDaily = order.plan.dataType === "Daily Unlimited";
  const profile = await orderEsimProfile({
    packageCode: order.planId,
    periodNum: isDaily ? order.days : undefined,
    transactionId: order.orderRef,
  });

  const now = new Date();
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DELIVERED",
      paidAt: order.paidAt ?? now,
      deliveredAt: now,
      supplierOrderNo: profile.supplierOrderNo,
      esimIccid: profile.iccid,
      esimActivation: profile.activationCode,
      esimSmdp: profile.smdpAddress,
    },
  });
}
