import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/dictionaries";

const readexPro = Readex_Pro({
  variable: "--font-readex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ezTravel — travel eSIMs for 200+ destinations",
  description:
    "Affordable travel eSIMs for China, Asia and 200+ destinations. Instant delivery, pay with Zelle, WeChat Pay or card.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value === "zh" ? "zh" : "en") as Locale;

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      data-scroll-behavior="smooth"
      className={`${readexPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <LanguageProvider initialLocale={locale}>
          <CartProvider>{children}</CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
