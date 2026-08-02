import { NextResponse } from "next/server";
import { getAuthenticatedPartner } from "@/lib/partner/auth";
import { checkoutPartnerCart } from "@/lib/partner/checkout";

export async function POST(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    items?: Array<{ planId: string; quantity: number }>;
    packageType?: "ESIM" | "TOPUP";
  } | null;

  if (!body?.items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const result = await checkoutPartnerCart({
      partnerId: partner.id,
      items: body.items,
      packageType: body.packageType,
    });
    return NextResponse.json({
      orderRef: result.order.orderRef,
      status: result.order.status,
      totalUsd: result.order.totalUsd,
      deliveryUrl: result.deliveryUrl,
      esimCount: result.esims.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
