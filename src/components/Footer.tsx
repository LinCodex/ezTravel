"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Footer() {
  const { t, locale } = useLanguage();

  const columns = [
    {
      title: t.home.footerShop,
      links: [
        { href: "/destinations", label: t.nav.destinations },
        { href: "/destinations?tab=local", label: t.home.footerLocal },
        { href: "/destinations?tab=regional", label: t.home.footerRegional },
        { href: "/destinations?tab=global", label: t.home.footerGlobal },
      ],
    },
    {
      title: t.home.footerLearn,
      links: [
        { href: "/how-it-works", label: t.home.footerWhatIsEsim },
        { href: "/how-it-works", label: t.nav.howItWorks },
        { href: "/compatibility", label: t.nav.compatibility },
      ],
    },
    {
      title: t.home.footerHelp,
      links: [
        { href: "/support", label: t.nav.support },
        { href: "/order", label: t.nav.findOrder },
        { href: "/trust", label: t.legalNav.trustCenter },
      ],
    },
  ];

  const legalLinks = [
    { href: "/trust", label: t.legalNav.trustCenter },
    { href: "/privacy", label: t.legalNav.privacy },
    { href: "/legal", label: t.legalNav.legalCenter },
    { href: "/cookies", label: t.legalNav.manageCookies },
    { href: "/links", label: t.legalNav.linkDirectory },
    { href: "/accessibility", label: t.legalNav.accessibility },
  ];

  return (
    <footer className="bg-black border-t border-white/10 px-5 md:px-10 pt-14 pb-10 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Logo className="h-5 w-5" />
              <span className="text-white text-sm">
                {t.brand}
                {locale === "zh" && (
                  <span className="text-neutral-400"> {t.brandZh}</span>
                )}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-3 leading-relaxed">
              {t.home.footerTagline}
            </p>
            <div className="flex items-center gap-2 mt-5 text-[11px] text-white/40">
              <span className="bg-neutral-900 rounded-full px-3 py-1.5">zelle</span>
              <span className="bg-neutral-900 rounded-full px-3 py-1.5">wechat pay</span>
              <span className="bg-neutral-900 rounded-full px-3 py-1.5">square</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-white/40 text-xs uppercase tracking-widest">
                  {col.title}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((l, i) => (
                    <li key={`${l.href}-${i}`}>
                      <Link
                        href={l.href}
                        className="text-white/70 hover:text-white text-sm transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col gap-4">
          <nav
            className="flex flex-wrap gap-x-4 gap-y-2"
            aria-label={t.legalNav.related}
          >
            {legalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/45 hover:text-white text-[11px] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-white/40 text-xs">
              ©2026 {t.brand}
              {locale === "zh" ? ` ${t.brandZh}` : ""}. {t.home.footerRights}
            </p>
            <p className="text-white/30 text-[11px]">
              esims for 200+ destinations · 5G where available
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
