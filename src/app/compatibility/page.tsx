import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompatibilityChecker } from "./CompatibilityChecker";

export default function CompatibilityPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <CompatibilityChecker />
      <Footer />
    </main>
  );
}
