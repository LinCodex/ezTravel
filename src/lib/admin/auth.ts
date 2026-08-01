import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ez_admin";

function isProd() {
  return process.env.NODE_ENV === "production";
}

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (isProd()) {
    if (!value || value.length < 24) {
      throw new Error(
        "ADMIN_SESSION_SECRET must be set to a random string of at least 24 characters in production"
      );
    }
    return value;
  }
  return value && value.length > 0 ? value : "dev-only-session-secret-change-me";
}

function adminUsername(): string {
  const value = process.env.ADMIN_USERNAME?.trim();
  if (isProd()) {
    if (!value) {
      throw new Error("ADMIN_USERNAME must be set in production");
    }
    return value;
  }
  return value && value.length > 0 ? value : "admin";
}

function adminPassword(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (isProd()) {
    if (!value || value.length < 12) {
      throw new Error(
        "ADMIN_PASSWORD must be set to a strong password (12+ characters) in production"
      );
    }
    return value;
  }
  // Local development fallback only when unset.
  return value && value.length > 0 ? value : "change-me-locally";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    const dummy = Buffer.alloc(left.length);
    timingSafeEqual(left, dummy);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function validCredentials(username: string, password: string): boolean {
  try {
    const userOk = safeEqualString(username, adminUsername());
    const passOk = safeEqualString(password, adminPassword());
    return userOk && passOk;
  } catch {
    return false;
  }
}

export function sessionToken(): string {
  const user = adminUsername();
  return `${user}.${sign(user)}`;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const user = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const expectedUser = adminUsername();
    const expectedSig = sign(expectedUser);
    return safeEqualString(user, expectedUser) && safeEqualString(sig, expectedSig);
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd(),
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}
