"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const STORAGE_KEY = "eztravel_cookie_prefs";

type Prefs = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
};

const DEFAULT: Prefs = {
  necessary: true,
  preferences: true,
  analytics: false,
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      necessary: true,
      preferences: parsed.preferences ?? true,
      analytics: parsed.analytics ?? false,
    };
  } catch {
    return DEFAULT;
  }
}

function writePrefs(prefs: Prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  document.cookie = `cookie_prefs=${encodeURIComponent(
    JSON.stringify({ preferences: prefs.preferences, analytics: prefs.analytics })
  )};path=/;max-age=31536000;SameSite=Lax`;
}

export function CookiePreferences() {
  const { t, locale } = useLanguage();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  function save(next: Prefs) {
    setPrefs(next);
    writePrefs(next);
    // If preferences cookies are declined, keep current page language for this session
    // but do not refresh the locale cookie on future toggles from LanguageProvider — user can still switch language.
    if (!next.preferences) {
      document.cookie = `locale=;path=/;max-age=0`;
    } else {
      document.cookie = `locale=${locale};path=/;max-age=31536000`;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  const rows: {
    key: keyof Prefs;
    title: string;
    text: string;
    locked?: boolean;
  }[] = [
    {
      key: "necessary",
      title: t.cookiesUi.necessary,
      text: t.cookiesUi.necessaryText,
      locked: true,
    },
    {
      key: "preferences",
      title: t.cookiesUi.preferences,
      text: t.cookiesUi.preferencesText,
    },
    {
      key: "analytics",
      title: t.cookiesUi.analytics,
      text: t.cookiesUi.analyticsText,
    },
  ];

  return (
    <div className="rounded-2xl bg-neutral-900/80 ring-1 ring-white/10 p-5 md:p-6">
      <h2 className="text-white text-lg font-medium">{t.cookiesUi.manageTitle}</h2>
      <p className="text-white/55 text-sm mt-2 leading-relaxed">
        {t.cookiesUi.manageSubtitle}
      </p>

      <div className="mt-6 divide-y divide-white/10">
        {rows.map((row) => (
          <div
            key={row.key}
            className="py-4 flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-white text-sm font-medium">{row.title}</p>
              <p className="text-white/50 text-xs mt-1 leading-relaxed">
                {row.text}
              </p>
            </div>
            <label className="shrink-0 inline-flex items-center gap-2 cursor-pointer">
              <span className="sr-only">{row.title}</span>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={prefs[row.key]}
                disabled={row.locked}
                onChange={(e) => {
                  if (row.locked) return;
                  save({ ...prefs, [row.key]: e.target.checked });
                }}
              />
              <span
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  prefs[row.key] ? "bg-white" : "bg-white/20"
                } ${row.locked ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full transition-transform ${
                    prefs[row.key]
                      ? "translate-x-4 bg-black"
                      : "translate-x-0 bg-white/80"
                  }`}
                />
              </span>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            save({ necessary: true, preferences: true, analytics: true })
          }
          className="bg-white text-black text-sm rounded-full px-5 py-2.5 hover:bg-neutral-200 transition-colors btn-press"
        >
          {t.cookiesUi.acceptAll}
        </button>
        <button
          type="button"
          onClick={() =>
            save({ necessary: true, preferences: false, analytics: false })
          }
          className="bg-neutral-800 text-white text-sm rounded-full px-5 py-2.5 ring-1 ring-white/10 hover:bg-neutral-700 transition-colors btn-press"
        >
          {t.cookiesUi.rejectOptional}
        </button>
        {saved && (
          <span className="text-white/50 text-xs">{t.cookiesUi.saved}</span>
        )}
      </div>

    </div>
  );
}
