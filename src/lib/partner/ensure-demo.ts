import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/partner/password";
import { stateFromZip } from "@/lib/tax/us-state-rates";

export const DEMO_PARTNER_EMAIL = "demo@partner.test";
export const DEMO_PARTNER_PASSWORD = "partner123";

/**
 * Upsert the local/mock demo partner account. Safe to call repeatedly.
 * Used so partner login works after a fresh migrate (local or Neon/Postgres).
 */
export async function ensureDemoPartner() {
  const email = DEMO_PARTNER_EMAIL;
  const existing = await prisma.partner.findUnique({ where: { email } });
  if (existing) {
    await prisma.partner.update({
      where: { id: existing.id },
      data: {
        passwordHash: hashPassword(DEMO_PARTNER_PASSWORD),
        status: "ACTIVE",
        // Keep a usable demo balance without wiping larger local balances.
        balanceUsd: existing.balanceUsd < 50 ? 500 : existing.balanceUsd,
      },
    });
    return existing.id;
  }

  const created = await prisma.partner.create({
    data: {
      email,
      passwordHash: hashPassword(DEMO_PARTNER_PASSWORD),
      companyName: "Demo Travel Store",
      contactFirstName: "Partner",
      contactLastName: "Admin",
      storeZip: "10001",
      storeState: stateFromZip("10001"),
      brandName: "Demo Travel Store",
      brandAlias: "demo-travel-store",
      brandEmail: email,
      supportEmail: email,
      balanceUsd: 500,
      status: "ACTIVE",
    },
  });
  return created.id;
}

export function isDbConnectivityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Can't reach database|P1001|P1003|P2021|P2022|no such table|does not exist|Unable to open|ECONNREFUSED|SQLITE_CANTOPEN/i.test(
      msg,
    )
  );
}

export function dbSetupHint(): string {
  return (
    "Database unavailable. Locally run: npx prisma db push && npx tsx scripts/ensure-demo-partner.ts. " +
    "On Vercel, SQLite is not supported — set DATABASE_URL to a Postgres URL (e.g. Neon) and run migrations."
  );
}
