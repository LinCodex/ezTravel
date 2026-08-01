"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function SupportWidget() {
  const { t } = useLanguage();

  return (
    <div className="bg-neutral-900/80 ring-1 ring-white/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-white text-sm font-medium">{t.support.contactTitle}</p>
        <p className="text-white/50 text-xs mt-1 leading-relaxed max-w-md">
          {t.support.contactText}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <div className="flex gap-2">
            <dt className="text-white/40">{t.support.emailLabel}</dt>
            <dd className="text-white/80">support@eztravel.example.com</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-white/40">{t.support.wechatLabel}</dt>
            <dd className="text-white/80">eztravel_esim</dd>
          </div>
        </dl>
      </div>
      <div className="flex gap-2 shrink-0">
        <a
          href="mailto:support@eztravel.example.com"
          className="bg-white text-black text-xs rounded-full px-4 py-2.5 hover:bg-neutral-200 transition-colors btn-press"
        >
          {t.support.emailLabel}
        </a>
        <Link
          href="/support"
          className="bg-neutral-800 text-white text-xs rounded-full px-4 py-2.5 hover:bg-neutral-700 transition-colors btn-press"
        >
          {t.nav.support}
        </Link>
      </div>
    </div>
  );
}
