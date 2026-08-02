"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y}/${m}/${d}`;
}

export function CustomDateField({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const base = value ? new Date(`${value}T12:00:00`) : new Date();
  const [view, setView] = useState({ year: base.getFullYear(), month: base.getMonth() });

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const days = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startPad = first.getDay();
    const count = new Date(view.year, view.month + 1, 0).getDate();
    const cells: Array<{ day: number | null; iso?: string }> = [];
    for (let i = 0; i < startPad; i++) cells.push({ day: null });
    for (let d = 1; d <= count; d++) {
      const iso = `${view.year}-${pad(view.month + 1)}-${pad(d)}`;
      cells.push({ day: d, iso });
    }
    return cells;
  }, [view]);

  const monthLabel = new Date(view.year, view.month, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <div className="pp-label">{label}</div>}
      <button
        type="button"
        className="pp-btn pp-btn-secondary pp-btn-rect w-full justify-between font-medium"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
            <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 8H17" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 2.5V5.5M13 2.5V5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value ? (
          <span
            className="text-[var(--pp-muted)]"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            ×
          </span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {open && (
        <div className="pp-menu left-0 mt-1 w-[280px] p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="pp-btn pp-btn-ghost px-2 py-1"
              onClick={() =>
                setView((v) =>
                  v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 },
                )
              }
            >
              ‹
            </button>
            <div className="text-sm font-semibold">{monthLabel}</div>
            <button
              type="button"
              className="pp-btn pp-btn-ghost px-2 py-1"
              onClick={() =>
                setView((v) =>
                  v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 },
                )
              }
            >
              ›
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[var(--pp-muted)]">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((cell, i) =>
              cell.day == null ? (
                <div key={`e-${i}`} />
              ) : (
                <button
                  key={cell.iso}
                  type="button"
                  className={`pp-btn pp-btn-rect h-8 px-0 text-xs ${
                    cell.iso === value ? "pp-btn-primary" : "pp-btn-ghost"
                  }`}
                  onClick={() => {
                    onChange(cell.iso!);
                    setOpen(false);
                  }}
                >
                  {cell.day}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
