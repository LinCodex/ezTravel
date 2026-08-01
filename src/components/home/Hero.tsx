"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const HEADLINE_SIZE = "text-[clamp(3.4rem,min(14vw,24vh),13rem)]";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full overflow-hidden bg-black h-[100svh] min-h-[560px] max-h-[1200px]">
      <video
        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4"
      />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative h-full w-full">
        <h1
          className={`hero-title absolute text-white font-medium ${HEADLINE_SIZE} left-4 md:left-10 top-[16%] md:top-[18%] animate-fade-up delay-100`}
        >
          {t.hero.word1}
        </h1>
        <h1
          className={`hero-title absolute text-white font-medium ${HEADLINE_SIZE} right-4 md:right-10 top-[37%] md:top-[38%] animate-fade-up delay-300`}
        >
          {t.hero.word2}
        </h1>
        <h1
          className={`hero-title absolute text-white font-medium ${HEADLINE_SIZE} left-[14%] md:left-[28%] top-[58%] animate-fade-up delay-500`}
        >
          {t.hero.word3}
        </h1>

        <p className="absolute left-5 md:left-10 top-[70%] sm:top-[46%] max-w-[240px] text-[13px] sm:text-[15px] leading-snug text-white/90 animate-fade-up delay-600">
          {t.hero.description}
        </p>

        <div className="absolute right-5 md:right-24 top-[13%] md:top-[14%] animate-fade-up delay-400">
          <div className="flex items-center gap-3 justify-end">
            <div className="hidden md:block h-px w-24 bg-white/40 rotate-[20deg]" />
            <span className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
              {t.hero.stat1Value}
            </span>
          </div>
          <p className="text-xs md:text-sm text-white/70 mt-1 text-right">
            {t.hero.stat1Label}
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />

        <div className="absolute left-5 md:left-20 bottom-24 md:bottom-24 animate-fade-up delay-500">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
              {t.hero.stat2Value}
            </span>
            <div className="hidden md:block h-px w-24 bg-white/40 rotate-[-20deg]" />
          </div>
          <p className="text-xs md:text-sm text-white/70 mt-1">{t.hero.stat2Label}</p>
        </div>

        <div className="absolute right-5 md:right-20 bottom-24 md:bottom-20 animate-fade-up delay-600">
          <div className="flex items-center gap-3 justify-end">
            <div className="hidden md:block h-px w-24 bg-white/40 rotate-[-20deg]" />
            <span className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
              {t.hero.stat3Value}
            </span>
          </div>
          <p className="text-xs md:text-sm text-white/70 mt-1 text-right">
            {t.hero.stat3Label}
          </p>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-700">
          <p className="text-white/50 text-[11px] tracking-widest uppercase">
            {t.hero.scroll}
          </p>
          <div className="h-8 w-px bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
