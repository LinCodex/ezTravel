import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegionPlans, type PlanSummary } from "./RegionPlans";

export const dynamic = "force-dynamic";

export default async function RegionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let plans;
  try {
    plans = await prisma.plan.findMany({
      where: { regionSlug: slug, visible: true },
      orderBy: [{ dataType: "asc" }, { gb: "asc" }, { validityDays: "asc" }],
    });
  } catch (error) {
    console.error("Failed to load plans:", error);
    notFound();
  }

  if (plans.length === 0) notFound();

  const summaries: PlanSummary[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    dataType: p.dataType,
    gb: p.gb,
    validityDays: p.validityDays,
    priceUsd: p.priceUsd,
    speed: p.speed,
    networks: p.networks,
    coverage: p.coverage,
    fupPolicy: p.fupPolicy,
  }));

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <RegionPlans region={plans[0].region} plans={summaries} />
      <Footer />
    </main>
  );
}
