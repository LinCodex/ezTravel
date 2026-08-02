import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";

export async function GET(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderRef = searchParams.get("orderRef");

  const orders = await prisma.partnerOrder.findMany({
    where: {
      partnerId: partner.id,
      ...(orderRef ? { orderRef } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Orders");
  ws.columns = [
    { header: "Order ID", key: "orderRef", width: 22 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Status", key: "status", width: 14 },
    { header: "Date", key: "date", width: 22 },
    { header: "Ordered By", key: "orderedBy", width: 22 },
    { header: "Package", key: "packageType", width: 12 },
    { header: "Subtotal", key: "subtotalUsd", width: 12 },
    { header: "Tax", key: "taxUsd", width: 10 },
    { header: "Total", key: "totalUsd", width: 12 },
  ];
  for (const o of orders) {
    ws.addRow({
      orderRef: o.orderRef,
      quantity: o.quantity,
      status: o.status,
      date: o.createdAt.toISOString(),
      orderedBy: o.orderedBy,
      packageType: o.packageType,
      subtotalUsd: o.subtotalUsd,
      taxUsd: o.taxUsd,
      totalUsd: o.totalUsd,
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const filename = orderRef ? `order-${orderRef}.xlsx` : "partner-orders.xlsx";
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
