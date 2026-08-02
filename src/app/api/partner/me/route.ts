import { NextResponse } from "next/server";
import { getAuthenticatedPartner, publicPartner } from "@/lib/partner/auth";

export async function GET() {
  const partner = await getAuthenticatedPartner();
  if (!partner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ partner: publicPartner(partner) });
}
