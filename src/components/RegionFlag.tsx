"use client";

import { getRegionFlagCodes } from "@/lib/destinations-meta";

const FLAG_CDN = "https://flagcdn.com";

export function RegionFlag({
  region,
  regionCode,
  className = "",
  size = "md",
}: {
  region: string;
  regionCode?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const codes = getRegionFlagCodes(region, regionCode);
  const dim =
    size === "sm" ? "h-5 w-7" : size === "lg" ? "h-9 w-12 md:h-11 md:w-14" : "h-7 w-10 md:h-8 md:w-11";

  if (codes.length === 0) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-sm bg-neutral-800 text-white/40 text-[10px] font-medium ${dim} ${className}`}
        aria-hidden
      >
        ··
      </span>
    );
  }

  if (codes.length === 1) {
    return (
      <span
        className={`inline-block overflow-hidden rounded-sm ring-1 ring-white/15 shadow-sm ${dim} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${FLAG_CDN}/w80/${codes[0]}.png`}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </span>
    );
  }

  // Multi-country: show every flag (wrap when needed)
  return (
    <span
      className={`inline-flex max-w-full flex-wrap items-center gap-1 ${className}`}
      aria-hidden
    >
      {codes.map((code, i) => (
        <span
          key={`${code}-${i}`}
          className={`inline-block shrink-0 overflow-hidden rounded-sm ring-1 ring-white/15 shadow-sm ${dim}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${FLAG_CDN}/w80/${code}.png`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </span>
      ))}
    </span>
  );
}
