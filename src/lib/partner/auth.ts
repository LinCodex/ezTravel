import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export { hashPassword, verifyPassword } from "./password";

const COOKIE_NAME = "ez_partner";

function secret(): string {
  const value =
    process.env.PARTNER_SESSION_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("PARTNER_SESSION_SECRET must be set in production");
  }
  return "eztravel-partner-session-secret-2026";
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

export function partnerSessionToken(partnerId: string): string {
  return `${partnerId}.${sign(partnerId)}`;
}

export function partnerCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export const PARTNER_COOKIE = COOKIE_NAME;

export async function getPartnerIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const partnerId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    if (!safeEqualString(sig, sign(partnerId))) return null;
    return partnerId;
  } catch {
    return null;
  }
}

export async function getAuthenticatedPartner() {
  const partnerId = await getPartnerIdFromCookie();
  if (!partnerId) return null;
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner || partner.status === "SUSPENDED") return null;
  return partner;
}

export function publicPartner(partner: {
  id: string;
  email: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  storeZip: string;
  storeState: string;
  status: string;
  role: string;
  balanceUsd: number;
  retailMarkupPercent: number;
  brandName: string;
  brandAlias: string;
  brandUrl: string;
  brandEmail: string;
  brandLogoUrl: string;
  brandIconUrl: string;
  brandHeroUrl: string;
  brandColor: string;
  supportEmail: string;
  supportPhone: string;
}) {
  return {
    id: partner.id,
    email: partner.email,
    companyName: partner.companyName,
    contactFirstName: partner.contactFirstName,
    contactLastName: partner.contactLastName,
    contactPhone: partner.contactPhone,
    storeZip: partner.storeZip,
    storeState: partner.storeState,
    status: partner.status,
    role: partner.role,
    balanceUsd: partner.balanceUsd,
    retailMarkupPercent: partner.retailMarkupPercent,
    brandName: partner.brandName,
    brandAlias: partner.brandAlias,
    brandUrl: partner.brandUrl,
    brandEmail: partner.brandEmail,
    brandLogoUrl: partner.brandLogoUrl,
    brandIconUrl: partner.brandIconUrl,
    brandHeroUrl: partner.brandHeroUrl,
    brandColor: partner.brandColor,
    supportEmail: partner.supportEmail,
    supportPhone: partner.supportPhone,
  };
}
