import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "Accessibility Statement — ezTravel",
  description: "ezTravel accessibility commitment and feedback channels.",
};

export default function AccessibilityPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <LegalPageShell slug="accessibility" />
      <Footer />
    </main>
  );
}
