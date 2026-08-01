"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartNavButton } from "./CartNavButton";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart/CartProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

import { AnimatedLangText } from "@/lib/i18n/AnimatedLangText";

export function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/destinations", label: t.nav.destinations },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/compatibility", label: t.nav.compatibility },
    { href: "/support", label: t.nav.support },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-10 pt-4 md:pt-6 flex items-center justify-between gap-2 transition-all duration-500 ${
          scrolled ? "translate-y-[-4px]" : ""
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-2 backdrop-blur rounded-full pl-4 pr-5 py-3 smooth-morph ${
            scrolled ? "bg-black/85 ring-1 ring-white/10" : "bg-neutral-900/90"
          }`}
        >
          <Logo />
          <span className="text-white text-sm font-normal tracking-tight whitespace-nowrap overflow-hidden">
            <AnimatedLangText>
              {t.brand}
              {locale === "zh" && (
                <span className="ml-1.5 text-neutral-400 font-normal">
                  {t.brandZh}
                </span>
              )}
            </AnimatedLangText>
          </span>
        </Link>

        <div
          className={`hidden lg:flex items-center gap-1 backdrop-blur rounded-full px-3 py-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-4 md:lg:top-6 smooth-morph ${
            scrolled ? "bg-black/85 ring-1 ring-white/10 shadow-2xl" : "bg-neutral-900/90 shadow-lg"
          }`}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors text-sm px-5 py-2 rounded-full whitespace-nowrap overflow-hidden smooth-morph ${
                pathname.startsWith(l.href)
                  ? "text-white bg-white/10 font-medium"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              <AnimatedLangText>{l.label}</AnimatedLangText>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
            className={`backdrop-blur text-neutral-300 hover:text-white text-sm rounded-full px-4 py-3 btn-press smooth-morph overflow-hidden ${
              scrolled ? "bg-black/85 ring-1 ring-white/10" : "bg-neutral-900/90"
            }`}
            aria-label="switch language"
          >
            <AnimatedLangText>{locale === "en" ? "中文" : "EN"}</AnimatedLangText>
          </button>
          <Link
            href="/destinations"
            className="hidden md:inline-block bg-white text-black text-sm font-normal rounded-full px-6 py-3 hover:bg-neutral-200 whitespace-nowrap btn-press smooth-morph overflow-hidden"
          >
            <AnimatedLangText>{t.nav.browsePlans}</AnimatedLangText>
          </Link>
          <CartNavButton scrolled={scrolled} />
          <button
            onClick={() => setOpen(!open)}
            aria-label={t.nav.menu}
            aria-expanded={open}
            className={`lg:hidden backdrop-blur rounded-full p-3.5 btn-press transition-colors ${
              scrolled ? "bg-black/85 ring-1 ring-white/10" : "bg-neutral-900/90"
            }`}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-px w-5 bg-white transition-transform duration-300 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-px w-5 bg-white transition-opacity duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 h-px w-5 bg-white transition-transform duration-300 ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[90] lg:hidden transition-all duration-500 ${
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setOpen(false)} />
        <div className="relative h-full flex flex-col justify-center px-8 pb-16">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hero-title text-white/90 hover:text-white text-5xl font-medium py-4 border-b border-white/10 transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
            >
              <AnimatedLangText>{l.label}</AnimatedLangText>
            </Link>
          ))}
          <div
            className={`flex flex-col gap-3 mt-10 transition-all duration-500 ${
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: open ? "440ms" : "0ms" }}
          >
            <Link
              href="/destinations"
              className="bg-white text-black text-sm text-center rounded-full px-6 py-4 hover:bg-neutral-200 transition-colors btn-press smooth-morph overflow-hidden"
            >
              <AnimatedLangText>{t.nav.browsePlans}</AnimatedLangText>
            </Link>
            <Link
              href="/cart"
              className="text-white/80 hover:text-white text-sm text-center py-2 transition-colors smooth-morph overflow-hidden"
            >
              <AnimatedLangText>
                {t.nav.cart}
                {count > 0 ? ` (${count})` : ""}
              </AnimatedLangText>
            </Link>
            <Link
              href="/order"
              className="text-white/60 hover:text-white text-sm text-center py-2 transition-colors smooth-morph overflow-hidden"
            >
              <AnimatedLangText>{t.nav.findOrder}</AnimatedLangText>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
