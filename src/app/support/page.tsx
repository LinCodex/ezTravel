import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SupportContent } from "./SupportContent";

export default function SupportPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <SupportContent />
      <Footer />
    </main>
  );
}
