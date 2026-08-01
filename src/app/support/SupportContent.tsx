"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SupportWidget } from "@/components/SupportWidget";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function SupportContent() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-medium">
            {t.support.title}
          </h1>
          <p className="text-white/70 mt-4 text-sm md:text-base">{t.support.subtitle}</p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10">
            <SupportWidget />
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="card-hover bg-neutral-900/80 rounded-2xl p-6 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white text-base font-medium">{t.support.orderTitle}</p>
              <p className="text-white/50 text-sm mt-2">{t.support.orderText}</p>
            </div>
            <Link
              href="/order"
              className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors btn-press text-center shrink-0"
            >
              {t.support.orderCta}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="hero-title text-3xl md:text-5xl font-medium mt-16">
            {t.support.faqTitle}
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-6 divide-y divide-white/10">
            {t.support.faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 group"
                >
                  <span className="text-white text-sm md:text-base group-hover:text-white/80 transition-colors">
                    {faq.q}
                  </span>
                  <span
                    className={`text-white/40 text-xl leading-none transition-transform duration-300 ${
                      open === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-400 ease-out ${
                    open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-white/60 text-sm leading-relaxed pb-5">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
