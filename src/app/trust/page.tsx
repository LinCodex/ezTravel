import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Trust Center — ezTravel",
  description: "How ezTravel protects payments, data, and customers.",
};

export default function TrustPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <LegalPageShell slug="trust" />
      <Footer />
    </main>
  );
}
