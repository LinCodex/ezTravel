import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Legal Center — ezTravel",
  description: "ezTravel Terms of Service and legal information.",
};

export default function LegalPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <LegalPageShell slug="legal" />
      <Footer />
    </main>
  );
}
