import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedPartner } from "@/lib/partner/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const partner = await getAuthenticatedPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim() || "";
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const feedback = await prisma.partnerFeedback.create({
    data: { partnerId: partner.id, message },
  });

  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";
  if (support) {
    await sendEmail({
      to: support,
      subject: `Partner feedback from ${partner.companyName}`,
      html: `<p><strong>${partner.companyName}</strong> (${partner.email})</p><p>${message}</p>`,
      text: message,
    });
  }

  return NextResponse.json({ id: feedback.id, ok: true });
}
