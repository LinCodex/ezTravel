"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AnimatedLangText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { locale } = useLanguage();

  return (
    <span key={locale} className={`inline-block animate-lang-slide-up ${className}`}>
      {children}
    </span>
  );
}
