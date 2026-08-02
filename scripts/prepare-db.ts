/**
 * Idempotent DB prep for deploys:
 * - seed plans from CSV if the catalog is empty
 * - upsert the mock partner account
 *
 * Caller should run `prisma db push` first.
 */
import { execSync } from "child_process";
import { prisma } from "../src/lib/db";
import {
  DEMO_PARTNER_EMAIL,
  DEMO_PARTNER_PASSWORD,
  ensureDemoPartner,
} from "../src/lib/partner/ensure-demo";

async function main() {
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    console.log("[prepare-db] No plans found — importing catalog…");
    execSync("npx tsx scripts/import-plans.ts", { stdio: "inherit" });
  } else {
    console.log(`[prepare-db] Catalog OK (${planCount} plans)`);
  }

  await ensureDemoPartner();
  console.log("[prepare-db] Demo partner ready:", DEMO_PARTNER_EMAIL, "/", DEMO_PARTNER_PASSWORD);
}

main()
  .catch((e) => {
    console.error("[prepare-db] failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
