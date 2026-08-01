"use client";

import { LegalDoc } from "@/components/legal/LegalDoc";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getLegalPage, type LegalSlug } from "@/lib/legal/content";

export function LegalPageShell({
  slug,
  children,
}: {
  slug: LegalSlug;
  children?: React.ReactNode;
}) {
  const { locale, t } = useLanguage();
  const content = getLegalPage(slug, locale);

  const related = [
    { href: "/trust", label: t.legalNav.trustCenter },
    { href: "/privacy", label: t.legalNav.privacy },
    { href: "/legal", label: t.legalNav.legalCenter },
    { href: "/cookies", label: t.legalNav.manageCookies },
    { href: "/accessibility", label: t.legalNav.accessibility },
    { href: "/links", label: t.legalNav.linkDirectory },
  ].filter((l) => {
    const map: Record<LegalSlug, string> = {
      trust: "/trust",
      privacy: "/privacy",
      legal: "/legal",
      cookies: "/cookies",
      accessibility: "/accessibility",
    };
    return l.href !== map[slug];
  });

  return (
    <LegalDoc content={content} related={related}>
      {children}
    </LegalDoc>
  );
}
