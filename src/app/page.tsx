import { prisma } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/home/Hero";
import {
  CtaBanner,
  PaymentMethods,
  PopularDestinations,
  Reviews,
  WhyUs,
  type DestinationSummary,
} from "@/components/home/HomeSections";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

const FEATURED = [
  "China mainland",
  "China (mainland HK Macao)",
  "China mainland & Japan & South Korea",
  "Hong Kong (China)",
  "Japan",
  "South Korea",
  "Thailand",
  "Singapore",
  "Vietnam",
  "USA & Canada",
  "Europe (40+ areas)",
  "Global (130+ areas)",
] as const;

export default async function HomePage() {
  const grouped = await prisma.plan.groupBy({
    by: ["region", "regionSlug"],
    where: { visible: true, region: { in: [...FEATURED] } },
    _min: { priceUsd: true },
    _count: { _all: true },
  });

  const destinations: DestinationSummary[] = FEATURED.flatMap((region) => {
    const g = grouped.find((x) => x.region === region);
    if (!g) return [];
    return [
      {
        region,
        regionSlug: g.regionSlug,
        minPrice: g._min.priceUsd ?? 0,
        planCount: g._count._all,
      },
    ];
  });

  return (
    <main className="bg-black">
      <Navbar />
      <Hero />
      <PopularDestinations destinations={destinations} />
      <WhyUs />
      <Reviews />
      <PaymentMethods />
      <CtaBanner />
      <Footer />
    </main>
  );
}
