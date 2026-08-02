import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  revokeEsim,
  suspendEsim,
  unsuspendEsim,
} from "@/lib/esim/access-client";

type Action = "suspend" | "unsuspend" | "revoke";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    action?: Action;
    source?: "consumer" | "partner";
  } | null;
  if (!body?.action || !body.source) {
    return NextResponse.json({ error: "action and source required" }, { status: 400 });
  }

  let esimTranNo: string | undefined;
  let iccid: string | undefined;

  if (body.source === "consumer") {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    esimTranNo = order.esimTranNo || undefined;
    iccid = order.esimIccid || undefined;
  } else {
    const esim = await prisma.partnerEsim.findUnique({ where: { id } });
    if (!esim) return NextResponse.json({ error: "Not found" }, { status: 404 });
    esimTranNo = esim.esimTranNo || undefined;
    iccid = esim.iccid || undefined;
  }

  if (!esimTranNo && !iccid) {
    return NextResponse.json({ error: "No supplier reference on this eSIM" }, { status: 409 });
  }

  try {
    if (body.action === "suspend") await suspendEsim({ esimTranNo, iccid });
    else if (body.action === "unsuspend") await unsuspendEsim({ esimTranNo, iccid });
    else await revokeEsim({ esimTranNo, iccid });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lifecycle op failed" },
      { status: 502 },
    );
  }

  if (body.source === "partner") {
    const status =
      body.action === "suspend" ? "SUSPENDED" : body.action === "revoke" ? "REVOKED" : "ACTIVE";
    await prisma.partnerEsim.update({
      where: { id },
      data: { status },
    });
  } else if (body.action === "revoke") {
    await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED", failureReason: "Revoked by admin" },
    });
  }

  return NextResponse.json({ ok: true });
}
