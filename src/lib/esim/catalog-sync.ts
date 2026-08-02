import { prisma } from "@/lib/db";
import { packageList, type SupplierPackage } from "@/lib/esim/access-client";
import { computeSellPrice } from "@/lib/pricing";
import { slugify } from "@/lib/utils";

const GB = 1024 * 1024 * 1024;

export type CatalogSyncResult = {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
};

/**
 * Supplier-sourced fields safe to refresh on every sync. Curated / CSV-enriched
 * fields (region, slug, coverage, speed, topUpType, networks, fupPolicy) are
 * only set on create — packageList either lacks them or carries a coarser
 * representation that would clobber the richer local values.
 */
function volatileFields(pkg: SupplierPackage) {
  return {
    name: pkg.name.trim(),
    dataType: pkg.dataType === 2 ? "Daily Unlimited" : "Data in Total",
    gb: Math.round((pkg.volume / GB) * 100) / 100,
    validityDays: pkg.duration || 1,
    costUsd: pkg.price,
  };
}

/** Full record for a package we've never seen; curated fields derived once. */
function newPlanData(pkg: SupplierPackage) {
  const region = pkg.description?.trim() || pkg.location || "Unknown";
  return {
    ...volatileFields(pkg),
    slug: pkg.slug?.trim() || pkg.packageCode,
    type: pkg.location.includes(",") ? "Multi-Area" : "Single",
    region,
    regionSlug: slugify(region),
    regionCode: pkg.location,
    coverage: region,
    speed: pkg.speed || "",
    topUpType: pkg.supportTopUpType === 2 ? "Data Reloadable" : "",
    networks: "",
    fupPolicy: "",
    visible: true,
  };
}

/**
 * Pull the supplier catalog (packageList) and upsert Plan rows.
 * - Preserves admin price overrides (priceOverridden).
 * - Never changes `visible` on existing plans (admin's curation stands).
 * - In mock mode packageList mirrors the current DB, so this is a safe no-op
 *   rehearsal of the live sync.
 */
export async function syncPlansFromProvider(
  params: { locationCode?: string } = {},
): Promise<CatalogSyncResult> {
  const packages = await packageList(params);

  const existing = await prisma.plan.findMany({
    select: { id: true, priceOverridden: true },
  });
  const existingMap = new Map(existing.map((p) => [p.id, p]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const batchSize = 200;
  for (let i = 0; i < packages.length; i += batchSize) {
    const batch = packages.slice(i, i + batchSize);
    await prisma.$transaction(
      batch.flatMap((pkg) => {
        if (!pkg.packageCode || !Number.isFinite(pkg.price) || pkg.price < 0) {
          skipped++;
          return [];
        }
        const prior = existingMap.get(pkg.packageCode);
        if (prior) {
          const data = volatileFields(pkg);
          updated++;
          return [
            prisma.plan.update({
              where: { id: pkg.packageCode },
              // Keep admin-set prices when re-syncing.
              data: prior.priceOverridden
                ? data
                : { ...data, priceUsd: computeSellPrice(data.costUsd) },
            }),
          ];
        }
        created++;
        const data = newPlanData(pkg);
        return [
          prisma.plan.create({
            data: {
              id: pkg.packageCode,
              ...data,
              priceUsd: computeSellPrice(data.costUsd),
            },
          }),
        ];
      }),
    );
  }

  return { fetched: packages.length, created, updated, skipped };
}
