import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { usageQuery } from "@/lib/esim/access-client";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const esim = await prisma.partnerEsim.findFirst({
    where: { id, partnerId: partner.id },
  });
  if (!esim) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best-effort plan GB from dataLabel like "5GB" or stored remaining baseline.
  const gbMatch = esim.dataLabel.match(/(\d+(?:\.\d+)?)\s*GB/i);
  const planGb = gbMatch ? Number(gbMatch[1]) : esim.dataRemainingGb || undefined;

  const usage = await usageQuery({
    esimTranNo: esim.esimTranNo || undefined,
    iccid: esim.iccid || undefined,
    planGb,
  });

  if (usage) {
    await prisma.partnerEsim.update({
      where: { id: esim.id },
      data: { dataRemainingGb: usage.remainingGb },
    });
  }

  return NextResponse.json({ usage });
}
