import { NextResponse } from "next/server";
import { isMockProvisioning } from "@/lib/esim/access-client";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { POST as webhookPost } from "../route";

/**
 * Dev-only webhook simulator: replays a payload through the real receiver so
 * the ORDER_STATUS / SMDP_EVENT / DATA_USAGE handling is testable without the
 * live supplier. Requires admin auth; disabled in production and in live mode.
 *
 * Example:
 *   POST /api/webhooks/esimaccess/simulate
 *   { "notifyType": "SMDP_EVENT", "content": { "iccid": "8985...", "smdpStatus": "ENABLED" } }
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" || !isMockProvisioning()) {
    return NextResponse.json({ error: "Simulator disabled" }, { status: 404 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.text();
  const forwarded = new Request("http://localhost/api/webhooks/esimaccess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return webhookPost(forwarded);
}
