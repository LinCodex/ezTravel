import { notFound } from "next/navigation";
import { BrandedDelivery } from "@/components/partner/BrandedDelivery";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function QuickSharePage({
  params,
}: {
  params: Promise<{ brandAlias: string; token: string }>;
}) {
  const { brandAlias, token } = await params;
  const partner = await prisma.partner.findUnique({ where: { brandAlias } });
  if (!partner) notFound();

  const link = await prisma.quickShareLink.findFirst({
    where: { token, partnerId: partner.id },
    include: {
      esim: true,
      order: { include: { esims: true } },
    },
  });
  if (!link) notFound();
  if (link.expiresAt && link.expiresAt < new Date()) notFound();

  const esims = link.esim
    ? [link.esim]
    : link.order?.esims || [];

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
      orderRef={link.order?.orderRef || link.esim?.iccid || token}
      esims={esims.map((e) => ({
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
