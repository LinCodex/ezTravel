import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { provisionOrder } from "@/lib/esim/provision";

/** Retry provisioning for FAILED (or re-provision PAID/DELIVERED). */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const retryable = ["FAILED", "PAID", "AWAITING_CONFIRMATION", "DELIVERED"];
  if (!retryable.includes(order.status)) {
    return NextResponse.json({ error: `Cannot retry from ${order.status}` }, { status: 409 });
  }

  try {
    // Ensure paidAt exists so provision doesn't lose payment context.
    if (!order.paidAt) {
      await prisma.order.update({
        where: { id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }
    const updated = await provisionOrder(id);
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Provision failed" },
      { status: 502 },
    );
  }
}
