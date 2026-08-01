import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { CookiePreferences } from "@/components/legal/CookiePreferences";

export const metadata = {
  title: "Manage Cookies — ezTravel",
  description: "Cookie policy and preference controls for ezTravel.",
};

export default function CookiesPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <Navbar />
      <LegalPageShell slug="cookies">
        <CookiePreferences />
      </LegalPageShell>
      <Footer />
    </main>
  );
}
