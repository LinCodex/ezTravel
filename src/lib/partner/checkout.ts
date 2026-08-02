import { appOrigin } from "@/lib/app-url";
import { prisma } from "@/lib/db";
import { isMockProvisioning, orderEsimProfile } from "@/lib/esim/access-client";
import { partnerOrderEmailHtml, sendEmail } from "@/lib/email";
import { dataLabel, partnerUnitPrice } from "@/lib/partner/pricing";
import { roundMoney } from "@/lib/tax/us-state-rates";
import { generatePartnerOrderRef } from "@/lib/utils";

export type CartLine = { planId: string; quantity: number };

type OrderItemInput = {
  planId: string;
  quantity: number;
  unitCostUsd: number;
  unitWholesale: number;
  taxUsd: number;
  networks: string;
  planName: string;
  region: string;
  regionCode: string;
  dataLabel: string;
  validityDays: number;
};

async function createPartnerOrderWithDebit(opts: {
  partnerId: string;
  orderRef: string;
  packageType: string;
  quantity: number;
  subtotalUsd: number;
  taxUsd: number;
  totalUsd: number;
  orderedBy: string;
  items: OrderItemInput[];
}) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.partner.update({
      where: { id: opts.partnerId },
      data: { balanceUsd: { decrement: opts.totalUsd } },
    });
    if (updated.balanceUsd < -1e-6) {
      throw new Error("Insufficient balance");
    }
    return tx.partnerOrder.create({
      data: {
        orderRef: opts.orderRef,
        partnerId: opts.partnerId,
        status: "PROCESSING",
        packageType: opts.packageType,
        quantity: opts.quantity,
        subtotalUsd: opts.subtotalUsd,
        taxUsd: opts.taxUsd,
        totalUsd: opts.totalUsd,
        orderedBy: opts.orderedBy,
        items: {
          create: opts.items.map((b) => ({
            planId: b.planId,
            quantity: b.quantity,
            unitCostUsd: b.unitCostUsd,
            unitWholesale: b.unitWholesale,
            taxUsd: b.taxUsd,
            networks: b.networks,
            planName: b.planName,
            region: b.region,
            dataLabel: b.dataLabel,
            validityDays: b.validityDays,
          })),
        },
      },
      include: { items: true },
    });
  });
}

export async function checkoutPartnerCart(opts: {
  partnerId: string;
  items: CartLine[];
  packageType?: "ESIM" | "TOPUP";
}) {
  const partner = await prisma.partner.findUniqueOrThrow({ where: { id: opts.partnerId } });
  if (partner.status !== "ACTIVE") throw new Error("Partner account is not active");

  const lines = opts.items.filter((i) => i.quantity > 0);
  if (!lines.length) throw new Error("Cart is empty");

  const plans = await prisma.plan.findMany({
    where: { id: { in: lines.map((l) => l.planId) }, visible: true },
  });
  const planMap = new Map(plans.map((p) => [p.id, p]));

  type Built = OrderItemInput & { unitTotal: number };

  const built: Built[] = [];
  for (const line of lines) {
    const plan = planMap.get(line.planId);
    if (!plan) throw new Error(`Plan not found: ${line.planId}`);
    const priced = partnerUnitPrice(plan.costUsd, partner.storeZip);
    built.push({
      planId: plan.id,
      quantity: line.quantity,
      unitCostUsd: plan.costUsd,
      unitWholesale: priced.wholesale,
      taxUsd: priced.tax,
      unitTotal: priced.total,
      networks: plan.networks,
      planName: plan.name,
      region: plan.region,
      regionCode: plan.regionCode || "",
      dataLabel: dataLabel(plan.gb, plan.dataType),
      validityDays: plan.validityDays,
    });
  }

  const quantity = built.reduce((s, b) => s + b.quantity, 0);
  const subtotalUsd = roundMoney(built.reduce((s, b) => s + b.unitWholesale * b.quantity, 0));
  const taxUsd = roundMoney(built.reduce((s, b) => s + b.taxUsd * b.quantity, 0));
  const totalUsd = roundMoney(subtotalUsd + taxUsd);

  if (partner.balanceUsd + 1e-9 < totalUsd) {
    throw new Error(`Insufficient balance. Need $${totalUsd.toFixed(2)}, have $${partner.balanceUsd.toFixed(2)}`);
  }

  const orderedBy = `${partner.contactFirstName} ${partner.contactLastName}`.trim() || partner.email;

  let order: Awaited<ReturnType<typeof createPartnerOrderWithDebit>> | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      order = await createPartnerOrderWithDebit({
        partnerId: partner.id,
        orderRef: generatePartnerOrderRef(),
        packageType: opts.packageType || "ESIM",
        quantity,
        subtotalUsd,
        taxUsd,
        totalUsd,
        orderedBy,
        items: built,
      });
      break;
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code !== "P2002") throw err;
    }
  }
  if (!order) throw new Error("Could not allocate order number");

  try {
    const createdEsims = [];
    // Mock profiles are instantly usable, so reflect a realistic lifecycle in demos.
    const mockMode = isMockProvisioning();
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const txId = `${order.orderRef}-${item.planId}-${i + 1}`;
        const plan = planMap.get(item.planId)!;
        const isDaily = plan.dataType === "Daily Unlimited";
        const profile = await orderEsimProfile({
          packageCode: item.planId,
          periodNum: isDaily ? plan.validityDays : undefined,
          transactionId: txId,
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + item.validityDays);
        const esim = await prisma.partnerEsim.create({
          data: {
            partnerId: partner.id,
            orderId: order.id,
            planId: item.planId,
            planName: item.planName,
            region: item.region,
            regionCode: plan.regionCode || "",
            dataLabel: item.dataLabel,
            validityDays: item.validityDays,
            networks: item.networks,
            status: mockMode ? "ACTIVE" : "PENDING_ACTIVATION",
            activatedAt: mockMode ? new Date() : null,
            iccid: profile.iccid,
            activationCode: profile.activationCode,
            smdpAddress: profile.smdpAddress,
            matchingId: profile.matchingId,
            supplierOrderNo: profile.supplierOrderNo,
            esimTranNo: profile.esimTranNo || null,
            dataRemainingGb: plan.gb,
            unitPaidUsd: roundMoney(item.unitWholesale + item.taxUsd),
            expiresAt,
          },
        });
        createdEsims.push(esim);
      }
    }

    const delivered = await prisma.partnerOrder.update({
      where: { id: order.id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
      include: { items: true, esims: true },
    });

    const deliveryUrl = `${appOrigin()}/p/${partner.brandAlias}/order/${order.orderRef}`;
    const to = partner.brandEmail || partner.email;
    await sendEmail({
      to,
      subject: `${partner.brandName || partner.companyName} eSIM order ${order.orderRef}`,
      html: partnerOrderEmailHtml({
        companyName: partner.companyName,
        brandName: partner.brandName,
        orderRef: order.orderRef,
        deliveryUrl,
        totalUsd,
        quantity,
      }),
      text: `Order ${order.orderRef} delivered. View: ${deliveryUrl}`,
    });

    return { order: delivered, esims: createdEsims, deliveryUrl };
  } catch (err) {
    await prisma.$transaction([
      prisma.partnerOrder.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      }),
      prisma.partner.update({
        where: { id: partner.id },
        data: { balanceUsd: { increment: totalUsd } },
      }),
    ]);
    throw err;
  }
}
