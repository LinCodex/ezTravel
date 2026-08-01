import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HowItWorksContent } from "./HowItWorksContent";

export default function HowItWorksPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <HowItWorksContent />
      <Footer />
    </main>
  );
}
