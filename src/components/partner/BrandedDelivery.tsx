import QRCode from "qrcode";
import {
  BrandedDeliveryView,
  type BrandTheme,
  type DeliveryEsim,
} from "@/components/partner/BrandedDeliveryView";

export type { BrandTheme, DeliveryEsim };

async function makeQr(code: string | null | undefined): Promise<string | null> {
  if (!code) return null;
  try {
    return await QRCode.toDataURL(code, {
      margin: 1,
      width: 280,
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}

/**
 * Server wrapper for the customer delivery pages.
 * QR codes are rendered server-side so the client never downloads the qrcode library.
 */
export async function BrandedDelivery({
  brand,
  orderRef,
  esims,
}: {
  brand: BrandTheme;
  orderRef: string;
  esims: DeliveryEsim[];
}) {
  const withQr = await Promise.all(
    esims.map(async (e) => ({
      ...e,
      qrDataUrl: e.qrDataUrl ?? (await makeQr(e.activationCode)),
    })),
  );

  return (
    <BrandedDeliveryView
      brand={brand}
      orderRef={orderRef}
      esims={withQr}
      className="min-h-screen"
    />
  );
}
