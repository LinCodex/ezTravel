"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { esimDevices } from "@/lib/devices";

export function CompatibilityChecker() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return esimDevices;
    return esimDevices
      .map((g) => ({
        brand: g.brand,
        devices: g.devices.filter(
          (d) =>
            d.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.devices.length > 0);
  }, [query]);

  return (
    <section className="px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-20 flex-1">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-medium">
            {t.compat.title}
          </h1>
          <p className="text-white/70 mt-4 text-sm md:text-base max-w-2xl">
            {t.compat.subtitle}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="card-hover bg-neutral-900/80 rounded-2xl p-6 mt-10">
            <p className="text-white text-base font-medium">⚡ {t.compat.quickTitle}</p>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              {t.compat.quickText}
            </p>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.compat.searchPlaceholder}
            className="w-full bg-neutral-900 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/40 transition-shadow mt-10"
          />
          <p className="text-white/40 text-xs mt-3">{t.compat.listNote}</p>
        </Reveal>

        {filtered.length === 0 ? (
          <p className="text-white/50 text-sm mt-10">{t.compat.noResults}</p>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {filtered.map((group, gi) => (
              <Reveal key={group.brand} delay={gi * 60}>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest">
                    {group.brand}
                  </p>
                  <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                    {group.devices.map((d) => (
                      <li
                        key={d}
                        className="bg-neutral-900/80 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <span className="text-white/85 text-sm">{d}</span>
                        <span className="text-green-400 text-[10px] whitespace-nowrap bg-green-500/10 rounded-full px-2.5 py-1">
                          ✓ {t.compat.supported}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3 mt-12">
          <Reveal>
            <div className="bg-yellow-500/5 ring-1 ring-yellow-500/20 rounded-2xl p-6 h-full">
              <p className="text-yellow-400 text-sm font-medium">⚠ {t.compat.warnTitle}</p>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">
                {t.compat.warnText}
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="bg-neutral-900/80 rounded-2xl p-6 h-full">
              <p className="text-white text-sm font-medium">🔒 {t.compat.lockTitle}</p>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">
                {t.compat.lockText}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
