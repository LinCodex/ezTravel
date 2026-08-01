"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function EsimVsPhysicalSim() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"esim" | "trad">("esim");
  const data = t.esimVsSim;

  return (
    <section className="bg-black px-5 md:px-10 py-20 md:py-32 border-t border-white/10 relative overflow-hidden">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="hero-title text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight">
              {data.title}
            </h2>
            <p className="text-white/60 mt-4 text-base md:text-lg">
              {data.subtitle}
            </p>
          </div>
        </Reveal>

        {/* Mobile View Toggle */}
        <div className="flex justify-center mt-8 sm:hidden">
          <div className="bg-neutral-900 p-1 rounded-full border border-white/10 flex gap-1">
            <button
              onClick={() => setActiveTab("esim")}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "esim"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              eSIM
            </button>
            <button
              onClick={() => setActiveTab("trad")}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "trad"
                  ? "bg-neutral-800 text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Physical SIM
            </button>
          </div>
        </div>

        {/* Cards Comparison Container */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-12 md:mt-16">
          {/* ezTravel eSIM Card */}
          <Reveal delay={100}>
            <div
              className={`h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border transition-all duration-300 relative group ${
                activeTab === "esim" ? "block" : "hidden sm:block"
              } border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)]`}
            >
              {/* Badge */}
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-black text-xs font-semibold px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {data.badgeRecommended}
              </div>

              {/* Card Header & SVG Diagram */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                    {data.esimTitle}
                  </h3>
                  <p className="text-emerald-400/90 text-sm mt-1">
                    {data.esimSubtitle}
                  </p>
                </div>

                {/* Clean eSIM Chip Diagram */}
                <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    {/* Chip outline */}
                    <rect x="4" y="3" width="16" height="18" rx="3" />
                    {/* Golden contacts grid */}
                    <path d="M8 7h8v10H8z" fill="currentColor" fillOpacity="0.15" />
                    <rect x="8" y="7" width="8" height="10" rx="1" strokeWidth="1.5" />
                    <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" />
                    <line x1="12" y1="7" x2="12" y2="17" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-4">
                {data.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-emerald-500/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs uppercase tracking-wider block font-medium">
                        {f.label}
                      </span>
                      <span className="text-white text-sm font-medium mt-0.5 block">
                        {f.esim}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-xs">
                  Zero roaming fees · Instant activation
                </span>
                <Link
                  href="/destinations"
                  className="bg-white text-black hover:bg-neutral-200 text-xs font-semibold px-5 py-2.5 rounded-full transition-colors btn-press inline-flex items-center"
                >
                  Browse Plans
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Traditional Physical SIM Card */}
          <Reveal delay={200}>
            <div
              className={`h-full rounded-3xl p-6 sm:p-8 bg-neutral-950/70 border border-white/10 transition-all duration-300 relative ${
                activeTab === "trad" ? "block" : "hidden sm:block"
              }`}
            >
              {/* Card Header & SVG Diagram */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white/70">
                    {data.tradTitle}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    {data.tradSubtitle}
                  </p>
                </div>

                {/* Physical SIM Diagram */}
                <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="w-8 h-8 text-white/30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 3h8.5L18 6.5V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
                    <path d="M9 11h6v5H9z" opacity="0.4" />
                    {/* Ejector pin icon */}
                    <path d="M12 2v4M12 20v2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-4">
                {data.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.04]"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400/70 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs uppercase tracking-wider block font-medium">
                        {f.label}
                      </span>
                      <span className="text-white/60 text-sm mt-0.5 block line-through decoration-white/20">
                        {f.trad}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/40 text-xs">
                  Physical card hassle & high roaming charges
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Lightweight Animated Signal Diagram Component */}
        <Reveal delay={300}>
          <div className="mt-16 bg-neutral-900/60 rounded-3xl p-6 md:p-10 border border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h4 className="text-xl font-semibold text-white">
                  How eSIM Connects You Instantly
                </h4>
                <p className="text-white/60 text-sm mt-2 leading-relaxed">
                  Your phone securely downloads the profile over encrypted Wi-Fi. As soon as your plane touches down, your phone locks onto local 5G cell towers with zero physical intervention.
                </p>
              </div>

              {/* Animated Interactive Graphic */}
              <div className="w-full md:w-auto flex-1 max-w-lg bg-black/60 rounded-2xl p-6 border border-white/10 relative">
                <div className="flex items-center justify-between gap-4">
                  {/* 5G Tower Icon */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M12 2v20M7 22l5-16 5 16M9 16h6M10 11h4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 8a9 9 0 0 1 14 0M8 11a5 5 0 0 1 8 0" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[11px] text-white/60 font-medium">Local 5G Tower</span>
                  </div>

                  {/* Animated Signal Beams */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2">
                    <div className="w-full h-1 bg-neutral-800 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500 to-teal-300 animate-[pulse-beam_2s_infinite]" />
                    </div>
                    <span className="text-[10px] text-emerald-400/80 mt-1 font-mono tracking-wider">
                      ENCRYPTED PROFILES
                    </span>
                  </div>

                  {/* Phone Icon */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="7" y="2" width="10" height="20" rx="2" />
                        <line x1="11" y1="5" x2="13" y2="5" strokeLinecap="round" />
                        <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[11px] text-white/60 font-medium">Your Smartphone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
