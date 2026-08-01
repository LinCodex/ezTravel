import { prisma } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DestinationsBrowser, type RegionSummary } from "./DestinationsBrowser";

export const dynamic = "force-dynamic";

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q, tab } = await searchParams;

  let regions: RegionSummary[] = [];

  try {
    const grouped = await prisma.plan.groupBy({
      by: ["region", "regionSlug", "type", "regionCode"],
      where: { visible: true },
      _min: { priceUsd: true },
      _count: { _all: true },
    });

    // Deduplicate when a region has multiple regionCode values.
    const bySlug = new Map<string, RegionSummary>();
    for (const g of grouped) {
      const existing = bySlug.get(g.regionSlug);
      if (!existing) {
        bySlug.set(g.regionSlug, {
          region: g.region,
          regionSlug: g.regionSlug,
          type: g.type,
          minPrice: g._min.priceUsd ?? 0,
          planCount: g._count._all,
          regionCode: g.regionCode || undefined,
        });
      } else {
        existing.planCount += g._count._all;
        existing.minPrice = Math.min(existing.minPrice, g._min.priceUsd ?? existing.minPrice);
      }
    }
    regions = [...bySlug.values()].sort((a, b) =>
      a.region.localeCompare(b.region)
    );
  } catch (error) {
    console.error("Failed to load destinations:", error);
  }

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <DestinationsBrowser
        regions={regions}
        initialQuery={q ?? ""}
        initialTab={tab === "local" || tab === "regional" || tab === "global" ? tab : "all"}
      />
      <Footer />
    </main>
  );
}
