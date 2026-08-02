import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function GET() {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const esims = await prisma.partnerEsim.findMany({
    where: { partnerId: partner.id },
    orderBy: { issuedAt: "desc" },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("eSIMs");
  ws.columns = [
    { header: "ICCID", key: "iccid", width: 24 },
    { header: "Plan", key: "planName", width: 28 },
    { header: "Region", key: "region", width: 18 },
    { header: "Data", key: "dataLabel", width: 14 },
    { header: "Validity Days", key: "validityDays", width: 12 },
    { header: "Status", key: "status", width: 18 },
    { header: "Assignee", key: "assignee", width: 18 },
    { header: "Nickname", key: "nickname", width: 18 },
    { header: "Paid USD", key: "unitPaidUsd", width: 12 },
    { header: "Issued At", key: "issuedAt", width: 22 },
    { header: "Activated At", key: "activatedAt", width: 22 },
    { header: "Expires At", key: "expiresAt", width: 22 },
    { header: "Notes", key: "notes", width: 30 },
  ];
  for (const e of esims) {
    ws.addRow({
      iccid: e.iccid,
      planName: e.planName,
      region: e.region,
      dataLabel: e.dataLabel,
      validityDays: e.validityDays,
      status: e.status,
      assignee: e.assignee,
      nickname: e.nickname,
      unitPaidUsd: e.unitPaidUsd,
      issuedAt: e.issuedAt.toISOString(),
      activatedAt: e.activatedAt?.toISOString() || "",
      expiresAt: e.expiresAt?.toISOString() || "",
      notes: e.notes,
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="partner-esims.xlsx"`,
    },
  });
}
