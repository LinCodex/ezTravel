import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { isMockProvisioning } from "@/lib/esim/access-client";
import { syncPlansFromProvider } from "@/lib/esim/catalog-sync";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncPlansFromProvider();
    return NextResponse.json({ ...result, mock: isMockProvisioning() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Catalog sync failed" },
      { status: 502 },
    );
  }
}
