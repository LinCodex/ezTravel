"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const items = t.trust.items;

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "" : "mt-4"}`}
      aria-label="trust signals"
    >
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1.5 text-[11px] md:text-xs text-white/60 bg-white/5 ring-1 ring-white/10 rounded-full px-3 py-1.5"
        >
          <span className="text-white/40">✓</span>
          {item}
        </span>
      ))}
    </div>
  );
}
