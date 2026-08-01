"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { LegalPageContent } from "@/lib/legal/types";

export function LegalDoc({
  content,
  related,
  children,
}: {
  content: LegalPageContent;
  related?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <article className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-24 flex-1">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            {t.legalNav.lastUpdated} · {content.updated}
          </p>
          <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-medium mt-3">
            {content.title}
          </h1>
          <div className="mt-6 space-y-4">
            {content.intro.map((p, i) => (
              <p key={i} className="text-white/70 text-sm md:text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        {related && related.length > 0 && (
          <Reveal delay={60}>
            <nav
              className="mt-8 flex flex-wrap gap-2"
              aria-label={t.legalNav.related}
            >
              {related.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs text-white/70 hover:text-white bg-neutral-900 ring-1 ring-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </Reveal>
        )}

        {children && <div className="mt-10">{children}</div>}

        <div className="mt-12 space-y-10">
          {content.sections.map((section, i) => (
            <Reveal key={section.heading} delay={Math.min(i, 6) * 40}>
              <section>
                <h2 className="text-white text-lg md:text-xl font-medium">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((p, pi) => (
                  <p
                    key={pi}
                    className="text-white/65 text-sm leading-relaxed mt-3"
                  >
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2 list-disc pl-5">
                    {section.bullets.map((b, bi) => (
                      <li key={bi} className="text-white/65 text-sm leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <p className="text-white/45 text-xs mt-3 leading-relaxed border-l border-white/15 pl-3">
                    {section.note}
                  </p>
                )}
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  );
}
