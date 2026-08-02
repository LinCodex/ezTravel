"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { matchesSearch } from "@/lib/partner/search";

export type SelectOption = { value: string; label: string };

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
  label,
  searchable,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
  /** Show a filter input when the menu is open (auto when options > 12). */
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);
  const enableSearch = searchable ?? options.length > 12;

  const visible = useMemo(() => {
    if (!filter.trim()) return options;
    return options.filter(
      (o) => matchesSearch(o.label, filter) || matchesSearch(o.value, filter),
    );
  }, [options, filter]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open && enableSearch) {
      setFilter("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, enableSearch]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label htmlFor={id} className="pp-label">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        className="pp-btn pp-btn-secondary pp-btn-rect w-full justify-between font-medium"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-[var(--pp-text)]" : "text-[var(--pp-muted)]"}>
          {selected?.label || placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="pp-menu left-0 right-0 mt-1" role="listbox">
          {enableSearch && (
            <div className="sticky top-0 z-[1] border-b border-white/10 bg-[var(--pp-card-solid)] p-2">
              <input
                ref={inputRef}
                className="pp-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Type to filter…"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {visible.length === 0 && (
            <div className="px-3 py-2 text-sm text-[var(--pp-muted)]">No matches</div>
          )}
          {visible.map((o) => (
            <button
              key={o.value || "__all"}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={`pp-menu-item ${o.value === value ? "active" : ""}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
