"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function HowItWorksContent() {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const steps = platform === "ios" ? t.order.installIos : t.order.installAndroid;

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-medium">
            {t.how.title}
          </h1>
          <p className="text-white/70 mt-4 text-sm md:text-base max-w-2xl">
            {t.how.subtitle}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="bg-neutral-900/80 rounded-2xl p-6 md:p-8 mt-12">
            <h2 className="text-white text-xl md:text-2xl font-medium hero-title">
              {t.how.whatTitle}
            </h2>
            <p className="text-white/60 text-sm md:text-base mt-3 leading-relaxed">
              {t.how.whatText}
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="hero-title text-3xl md:text-5xl font-medium mt-16">
            {t.how.stepsTitle}
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-2.5 md:gap-3 mt-8">
          {t.how.steps.map((step, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="card-hover bg-neutral-900/80 rounded-2xl p-6 h-full">
                <span className="text-white/40 text-5xl font-medium hero-title">
                  0{i + 1}
                </span>
                <h3 className="text-white text-lg font-medium mt-4">{step.title}</h3>
                <p className="text-white/60 text-sm mt-2 leading-relaxed">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <h2 className="hero-title text-3xl md:text-5xl font-medium mt-16">
            {t.how.installTitle}
          </h2>
          <div className="mt-6 flex items-center gap-1 bg-neutral-900 rounded-full px-1.5 py-1.5 w-fit">
            <button
              onClick={() => setPlatform("ios")}
              className={`text-xs md:text-sm px-5 py-2 rounded-full transition-all duration-300 btn-press ${
                platform === "ios" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setPlatform("android")}
              className={`text-xs md:text-sm px-5 py-2 rounded-full transition-all duration-300 btn-press ${
                platform === "android"
                  ? "bg-white text-black"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Android
            </button>
          </div>
          <ol className="mt-6 flex flex-col gap-2.5">
            {steps.map((s, i) => (
              <li
                key={`${platform}-${i}`}
                className="bg-neutral-900/80 rounded-xl px-5 py-4 text-white/70 text-sm flex gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-white/30 font-medium">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="hero-title text-3xl md:text-5xl font-medium mt-16">
            {t.how.tipsTitle}
          </h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {t.how.tips.map((tip, i) => (
              <li
                key={i}
                className="bg-neutral-900/80 rounded-xl px-5 py-4 text-white/60 text-sm leading-relaxed"
              >
                {tip}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={80}>
          <div className="bg-neutral-900/80 rounded-2xl p-6 md:p-8 mt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h2 className="text-white text-lg md:text-xl font-medium">
                {t.how.compatTitle}
              </h2>
              <p className="text-white/50 text-sm mt-1">{t.how.compatText}</p>
            </div>
            <Link
              href="/compatibility"
              className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors btn-press text-center shrink-0"
            >
              {t.how.compatCta}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
