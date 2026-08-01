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
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
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
