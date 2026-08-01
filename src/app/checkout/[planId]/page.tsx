import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  let plan;
  try {
    plan = await prisma.plan.findUnique({ where: { id: planId } });
  } catch (error) {
    console.error("Failed to load plan:", error);
    notFound();
  }
  if (!plan || !plan.visible) notFound();

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <CheckoutForm
        plan={{
          id: plan.id,
          name: plan.name,
          region: plan.region,
          dataType: plan.dataType,
          gb: plan.gb,
          validityDays: plan.validityDays,
          priceUsd: plan.priceUsd,
        }}
      />
      <Footer />
    </main>
  );
}
