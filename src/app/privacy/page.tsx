import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Privacy Policy — ezTravel",
  description: "How ezTravel collects, uses, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <LegalPageShell slug="privacy" />
      <Footer />
    </main>
  );
}
