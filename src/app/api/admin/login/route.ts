import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  sessionToken,
  validCredentials,
} from "@/lib/admin/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(clientKey(req, "admin-login"), { limit: 10, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);
  const { username, password } = (body ?? {}) as {
    username?: string;
    password?: string;
  };

  if (!username || !password || !validCredentials(username, password)) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), adminCookieOptions());
  return res;
}
