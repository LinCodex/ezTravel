import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { provisionOrder } from "@/lib/esim/provision";

/** Mock Square card payment: instantly marks the order paid and provisions the eSIM. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { orderRef: ref.toUpperCase() } });
  if (!order || order.email !== email) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (order.paymentMethod !== "SQUARE" || order.status !== "AWAITING_PAYMENT") {
    return NextResponse.json({ error: "invalid order state" }, { status: 409 });
  }

  // Simulate card processing latency.
  await new Promise((r) => setTimeout(r, 800));

  await provisionOrder(order.id);
  return NextResponse.json({ ok: true });
}
