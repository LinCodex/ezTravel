import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OrderLookup } from "./OrderLookup";

export default function OrderLookupPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <OrderLookup />
      <Footer />
    </main>
  );
}
