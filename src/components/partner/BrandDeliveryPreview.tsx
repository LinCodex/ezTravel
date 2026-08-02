"use client";

import { BrandedDeliveryView } from "@/components/partner/BrandedDeliveryView";
import { SAMPLE_ICCID, SAMPLE_LPA, SAMPLE_SMDP } from "@/lib/partner/lpa-links";

export function BrandDeliveryPreview({
  brandName,
  brandAlias,
  brandColor,
  brandLogoUrl,
  brandHeroUrl,
  supportEmail,
  supportPhone,
}: {
  brandName: string;
  brandAlias: string;
  brandColor: string;
  brandLogoUrl: string;
  brandHeroUrl: string;
  supportEmail: string;
  supportPhone: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="pp-scroll max-h-[720px] overflow-auto">
        <BrandedDeliveryView
          preview
          brand={{
            brandName: brandName || "Your brand",
            brandAlias: brandAlias || "alias",
            brandColor: brandColor || "#10b981",
            brandLogoUrl,
            brandHeroUrl,
            supportEmail,
            supportPhone,
          }}
          orderRef="PO-SAMPLE-DEMO"
          esims={[
            {
              iccid: SAMPLE_ICCID,
              activationCode: SAMPLE_LPA,
              smdpAddress: SAMPLE_SMDP,
              planName: "China 1GB / 7 Days",
              region: "China",
              dataLabel: "1 GB",
              validityDays: 7,
              nickname: "Sample customer",
            },
          ]}
        />
      </div>
    </div>
  );
}
