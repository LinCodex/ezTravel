import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { provisionOrder } from "@/lib/esim/provision";
import { gatewayFor } from "@/lib/payments";

/** Mock Square card payment for a multi-item cart checkout. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ group: string }> },
) {
  const { group } = await params;
  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { cartGroup: group.toUpperCase(), email },
  });
  if (orders.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (orders.some((o) => o.paymentMethod !== "SQUARE" || o.status !== "AWAITING_PAYMENT")) {
    return NextResponse.json({ error: "invalid order state" }, { status: 409 });
  }

  const total = orders.reduce((s, o) => s + o.amountUsd, 0);
  const charge = await gatewayFor("SQUARE").charge({
    amountUsd: total,
    orderRef: group.toUpperCase(),
    email,
    method: "SQUARE",
  });
  if (!charge.ok) {
    return NextResponse.json({ error: charge.error }, { status: 402 });
  }

  for (const order of orders) {
    await provisionOrder(order.id);
  }

  return NextResponse.json({ ok: true, providerRef: charge.providerRef });
}
