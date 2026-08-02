import { notFound } from "next/navigation";
import { BrandedDelivery } from "@/components/partner/BrandedDelivery";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PartnerBrandedOrderPage({
  params,
}: {
  params: Promise<{ brandAlias: string; orderRef: string }>;
}) {
  const { brandAlias, orderRef } = await params;
  const partner = await prisma.partner.findUnique({ where: { brandAlias } });
  if (!partner) notFound();

  const order = await prisma.partnerOrder.findFirst({
    where: { orderRef, partnerId: partner.id },
    include: { esims: true },
  });
  if (!order) notFound();

  return (
    <BrandedDelivery
      brand={{
        brandName: partner.brandName || partner.companyName,
        brandAlias: partner.brandAlias,
        brandColor: partner.brandColor,
        brandLogoUrl: partner.brandLogoUrl,
        brandHeroUrl: partner.brandHeroUrl,
        supportEmail: partner.supportEmail || partner.brandEmail || partner.email,
        supportPhone: partner.supportPhone,
      }}
      orderRef={order.orderRef}
      esims={order.esims.map((e) => ({
        iccid: e.iccid,
        activationCode: e.activationCode,
        smdpAddress: e.smdpAddress,
        planName: e.planName,
        region: e.region,
        dataLabel: e.dataLabel,
        validityDays: e.validityDays,
        nickname: e.nickname,
        assignee: e.assignee,
      }))}
    />
  );
}
