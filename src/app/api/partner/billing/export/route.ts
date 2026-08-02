import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function GET(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const invNumber = searchParams.get("inv");

  const topups = await prisma.balanceTopUp.findMany({
    where: {
      partnerId: partner.id,
      ...(invNumber ? { invNumber } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("ezTravel Partner Balance Top-ups", 14, 18);
  doc.setFontSize(10);
  doc.text(`${partner.companyName} · ${partner.email}`, 14, 26);

  let y = 36;
  for (const t of topups) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${t.invNumber}  $${t.amountUsd.toFixed(2)}  ${t.paymentType}  ${t.status}  ${t.createdAt.toISOString().slice(0, 10)}`,
      14,
      y,
    );
    y += 8;
  }

  if (!topups.length) {
    doc.text("No top-up records.", 14, y);
  }

  const buffer = Buffer.from(doc.output("arraybuffer"));
  const filename = invNumber ? `${invNumber}.pdf` : "partner-topups.pdf";
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
