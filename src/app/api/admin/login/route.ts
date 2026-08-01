import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  sessionToken,
  validCredentials,
} from "@/lib/admin/auth";

export async function POST(req: Request) {
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
