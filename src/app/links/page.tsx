import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LinkDirectoryContent } from "./LinkDirectoryContent";

export const metadata = {
  title: "Link Directory — ezTravel",
  description: "Directory of ezTravel shop, support, and legal pages.",
};

export default function LinksPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <LinkDirectoryContent />
      <Footer />
    </main>
  );
}
