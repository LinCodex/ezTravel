/**
 * Sync the Plan catalog from the eSIM provider (packageList).
 * In mock mode this mirrors the current DB and is a safe no-op rehearsal.
 *
 * Usage:
 *   npx tsx scripts/sync-plans.ts [locationCode]
 */
import { prisma } from "../src/lib/db";
import { syncPlansFromProvider } from "../src/lib/esim/catalog-sync";
import { isMockProvisioning } from "../src/lib/esim/access-client";

async function main() {
  const locationCode = process.argv[2];
  console.log(
    `Syncing plans from ${isMockProvisioning() ? "MOCK provider" : "LIVE eSIM Access API"}` +
      (locationCode ? ` (location: ${locationCode})` : ""),
  );
  const result = await syncPlansFromProvider(locationCode ? { locationCode } : {});
  console.log(
    `Fetched ${result.fetched} packages: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
