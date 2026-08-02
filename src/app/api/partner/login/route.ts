import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  PARTNER_COOKIE,
  partnerCookieOptions,
  partnerSessionToken,
  publicPartner,
  verifyPassword,
} from "@/lib/partner/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(clientKey(req, "partner-login"), { limit: 15, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  try {
    const partner = await prisma.partner.findUnique({ where: { email } });
    if (!partner || !verifyPassword(password, partner.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (partner.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const res = NextResponse.json({ partner: publicPartner(partner) });
    res.cookies.set(PARTNER_COOKIE, partnerSessionToken(partner.id), partnerCookieOptions());
    return res;
  } catch (err) {
    console.error("[partner/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
