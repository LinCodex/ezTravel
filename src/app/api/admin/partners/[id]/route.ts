import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { hashPassword } from "@/lib/partner/password";
import { stateFromZip } from "@/lib/tax/us-state-rates";

const VALID_STATUSES = ["ACTIVE", "SUSPENDED"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    status?: string;
    companyName?: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactPhone?: string;
    storeZip?: string;
    email?: string;
    balanceAdjust?: number;
    password?: string;
    adminNotes?: string;
  } | null;

  const data: Record<string, unknown> = {};
  if (body?.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body?.companyName) data.companyName = body.companyName.trim();
  if (body?.contactFirstName) data.contactFirstName = body.contactFirstName.trim();
  if (body?.contactLastName) data.contactLastName = body.contactLastName.trim();
  if (body?.contactPhone !== undefined) data.contactPhone = body.contactPhone.trim();
  if (body?.email) data.email = body.email.trim().toLowerCase();
  if (body?.storeZip) {
    data.storeZip = body.storeZip.trim();
    data.storeState = stateFromZip(body.storeZip.trim());
  }
  if (typeof body?.balanceAdjust === "number" && !Number.isNaN(body.balanceAdjust)) {
    data.balanceUsd = { increment: body.balanceAdjust };
  }
  if (body?.password) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    data.passwordHash = hashPassword(body.password);
  }
  if (body?.adminNotes !== undefined) data.adminNotes = body.adminNotes;

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const partner = await prisma.partner.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      companyName: true,
      contactFirstName: true,
      contactLastName: true,
      contactPhone: true,
      storeZip: true,
      storeState: true,
      status: true,
      balanceUsd: true,
      brandAlias: true,
    },
  });
  return NextResponse.json({ partner });
}
