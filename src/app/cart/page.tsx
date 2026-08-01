import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartContent } from "./CartContent";

export const metadata = {
  title: "Cart — ezTravel",
  description: "Review your travel eSIM plans and checkout together.",
};

export default function CartPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <CartContent />
      <Footer />
    </main>
  );
}
