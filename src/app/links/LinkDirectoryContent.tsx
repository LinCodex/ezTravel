"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { linkDirectory } from "@/lib/legal/content";

export function LinkDirectoryContent() {
  const { locale, t } = useLanguage();
  const content = linkDirectory[locale];

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
          <p className="text-white/70 text-sm md:text-base leading-relaxed mt-6">
            {content.intro}
          </p>
        </Reveal>

        <div className="mt-12 space-y-10">
          {content.groups.map((group, i) => (
            <Reveal key={group.heading} delay={i * 60}>
              <section>
                <h2 className="text-white/40 text-xs uppercase tracking-widest">
                  {group.heading}
                </h2>
                <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                  {group.links.map((l) => (
                    <li key={`${group.heading}-${l.href}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="block rounded-xl bg-neutral-900/80 ring-1 ring-white/10 px-4 py-3 text-sm text-white/80 hover:text-white hover:ring-white/25 transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  );
}
