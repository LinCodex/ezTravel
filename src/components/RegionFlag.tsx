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

  // Multi-country: stack up to 3 flags
  const shown = codes.slice(0, 3);
  return (
    <span className={`relative inline-flex items-center ${className}`} aria-hidden>
      {shown.map((code, i) => (
        <span
          key={`${code}-${i}`}
          className={`inline-block overflow-hidden rounded-sm ring-1 ring-black/40 shadow-sm ${dim} ${
            i > 0 ? "-ml-3" : ""
          }`}
          style={{ zIndex: shown.length - i }}
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
      {codes.length > 3 && (
        <span className="ml-1.5 text-[10px] text-white/50 font-medium">+{codes.length - 3}</span>
      )}
    </span>
  );
}
