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
          <div className={activeTab === "esim" ? "block" : "hidden sm:block"}>
            <Reveal delay={100}>
              <div className="h-full rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)] transition-all duration-300 relative group">
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
          </div>

          {/* Traditional Physical SIM Card */}
          <div className={activeTab === "trad" ? "block" : "hidden sm:block"}>
            <Reveal delay={200}>
              <div className="h-full rounded-3xl p-6 sm:p-8 bg-neutral-950/70 border border-white/10 transition-all duration-300 relative">
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
                      <svg className="w-6 h-6" viewBox="0 0 199.653 199.653" fill="currentColor">
                        <g>
                          <path d="M131.111,122.83l-1.696-1.378l-21.913-74.605c2.552-2.086,4.001-5.118,4.001-8.41c0-6.023-4.903-10.93-10.93-10.93c-6.023,0-10.926,4.907-10.926,10.93c0,3.876,2.047,7.412,5.393,9.38L83.387,87.514l-1.668,1.489l0.988,0.805l-31.616,107.62l-0.236,0.809l4.835,1.414l3.847-13.077l66.391-59.13l20.983,71.405l0.24,0.805l4.835-1.414l-21.895-74.497L131.111,122.83z M123.338,122.987l-61.112,54.431l24.723-84.15L123.338,122.987z M89.478,88.831L109.37,71.08l13.142,44.725L89.478,88.831z M90.506,81.154l9.362-31.837c0.952,0.111,1.95,0.011,3.042-0.24l4.892,16.652L90.506,81.154z"/>
                          <path d="M121.09,33.945c0,2.348-0.612,4.667-1.761,6.71l-0.2,0.673l2.215,2.605l0.616-1.009c1.675-2.709,2.555-5.819,2.555-8.979c0-3.003-0.809-5.97-2.33-8.582l-0.412-0.709l-0.723,0.404c-0.472,0.258-0.963,0.483-1.464,0.673l-0.952,0.347l0.523,0.87C120.421,29.067,121.09,31.487,121.09,33.945z"/>
                          <path d="M126.713,50.816c0.125,0.132,0.258,0.254,0.379,0.39l0.651,0.719l0.619-0.759c4.005-4.867,6.209-10.987,6.209-17.221c0-5.662-1.768-11.116-5.118-15.79l-0.676-0.938l-0.684,0.934c-0.354,0.49-0.719,0.981-1.099,1.453l-0.387,0.487l0.351,0.512c2.741,3.983,4.184,8.589,4.184,13.346c0,5.458-1.814,10.597-5.25,14.874l-0.401,0.505l0.712,0.963C126.369,50.469,126.541,50.644,126.713,50.816z"/>
                          <path d="M142.066,33.945c0,8.213-2.985,16.219-8.403,22.536l-0.537,0.626l0.619,0.548c0.301,0.268,0.612,0.53,0.92,0.784l1.066,0.909l0.544-0.637c5.944-6.932,9.219-15.729,9.219-24.769c0-9.337-3.446-18.342-9.692-25.349l-0.691-0.787l-0.616,0.855c-0.351,0.487-0.694,0.991-1.041,1.507l-0.365,0.53l0.422,0.487C139.031,17.515,142.066,25.592,142.066,33.945z"/>
                          <path d="M152.985,33.945c0,10.794-3.862,21.28-10.88,29.536l-0.558,0.662l0.676,0.533c0.394,0.326,0.791,0.662,1.174,0.995l0.777,0.673l0.548-0.644c7.541-8.872,11.696-20.145,11.696-31.755c0-12.39-4.652-24.232-13.099-33.348L142.764,0l-0.616,0.533c-0.29,0.251-0.583,0.523-0.863,0.784l-1.081,0.984l0.58,0.626C148.655,11.402,152.985,22.418,152.985,33.945z"/>
                          <path d="M78.305,43.934l2.316-2.745l-0.297-0.53c-1.152-2.044-1.764-4.363-1.764-6.71c0-2.462,0.673-4.882,1.936-7l0.519-0.87l-0.948-0.347c-0.501-0.193-0.991-0.415-1.464-0.673l-0.719-0.404l-0.412,0.709c-1.532,2.613-2.333,5.579-2.333,8.582c0,3.157,0.88,6.267,2.552,8.979L78.305,43.934z"/>
                          <path d="M71.294,51.167l0.612,0.759l0.655-0.719c0.125-0.136,0.251-0.258,0.383-0.39c0.172-0.172,0.344-0.347,0.548-0.587l0.673-0.902l-0.404-0.505c-3.432-4.277-5.254-9.416-5.254-14.874c0-4.756,1.449-9.362,4.184-13.346l0.354-0.512l-0.39-0.487c-0.383-0.469-0.744-0.963-1.102-1.453l-0.68-0.934l-0.673,0.941c-3.346,4.67-5.118,10.128-5.118,15.79C65.081,40.18,67.29,46.296,71.294,51.167z"/>
                          <path d="M63.381,58.715l0.544,0.637l1.066-0.909c0.308-0.254,0.616-0.519,0.916-0.784l0.623-0.548l-0.544-0.626c-5.418-6.317-8.4-14.319-8.4-22.536c0-8.353,3.038-16.431,8.553-22.754l0.422-0.487l-0.361-0.533c-0.347-0.519-0.698-1.02-1.041-1.507l-0.612-0.855L63.85,8.6c-6.252,7.007-9.692,16.012-9.692,25.349C54.162,42.986,57.433,51.786,63.381,58.715z"/>
                          <path d="M55.612,66.227l0.641-0.551c0.39-0.333,0.784-0.673,1.185-0.995l0.673-0.533l-0.558-0.662c-7.022-8.256-10.887-18.742-10.887-29.536c0-11.531,4.338-22.543,12.207-31.014l0.576-0.626l-1.07-0.984c-0.29-0.261-0.58-0.533-0.87-0.784l-0.619-0.533l-0.548,0.598c-8.45,9.115-13.106,20.958-13.106,33.348c0,11.61,4.155,22.883,11.699,31.755L55.612,66.227z"/>
                        </g>
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
