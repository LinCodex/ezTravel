import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OrderStatus } from "./OrderStatus";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { ref } = await params;
  const { email } = await searchParams;

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <OrderStatus orderRef={ref.toUpperCase()} email={email ?? ""} />
      <Footer />
    </main>
  );
}
