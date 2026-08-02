/**
 * Typed environment access. Validates critical secrets at first use.
 * Production fails closed for missing admin/session secrets; development warns.
 */

type EnvShape = {
  DATABASE_URL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  ADMIN_SESSION_SECRET: string;
  PARTNER_SESSION_SECRET: string;
  ESIMACCESS_ACCESS_CODE: string;
  ESIMACCESS_SECRET_KEY: string;
  ESIMACCESS_BASE_URL: string;
  ESIMACCESS_USE_MOCK: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  NEXT_PUBLIC_APP_URL: string;
};

function read(name: keyof EnvShape, fallback = ""): string {
  return (process.env[name] || fallback).trim();
}

let warned = false;

export function getEnv(): EnvShape {
  const env: EnvShape = {
    DATABASE_URL: read("DATABASE_URL", "file:./dev.db"),
    ADMIN_USERNAME: read("ADMIN_USERNAME", "admin"),
    ADMIN_PASSWORD: read("ADMIN_PASSWORD"),
    ADMIN_SESSION_SECRET: read("ADMIN_SESSION_SECRET"),
    PARTNER_SESSION_SECRET: read("PARTNER_SESSION_SECRET") || read("ADMIN_SESSION_SECRET"),
    ESIMACCESS_ACCESS_CODE: read("ESIMACCESS_ACCESS_CODE"),
    ESIMACCESS_SECRET_KEY: read("ESIMACCESS_SECRET_KEY"),
    ESIMACCESS_BASE_URL: read("ESIMACCESS_BASE_URL", "https://api.esimaccess.com/api/v1/open"),
    ESIMACCESS_USE_MOCK: read("ESIMACCESS_USE_MOCK"),
    RESEND_API_KEY: read("RESEND_API_KEY"),
    EMAIL_FROM: read("EMAIL_FROM", "noreply@eztravel.local"),
    NEXT_PUBLIC_APP_URL: read("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  };

  const prod = process.env.NODE_ENV === "production";
  const missing: string[] = [];
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 24) {
    missing.push("ADMIN_SESSION_SECRET (>=24 chars)");
  }

  if (missing.length) {
    const msg = `[env] Missing/weak: ${missing.join(", ")}`;
    if (prod) throw new Error(msg);
    if (!warned) {
      console.warn(msg + " — ok for local mock, required before production.");
      warned = true;
    }
  }

  return env;
}
