"use client";

const PRESETS = [
  "#10b981",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fb7185",
  "#fbbf24",
  "#ffffff",
];

export function BrandColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#10b981";

  return (
    <div className="space-y-3">
      <div className="pp-label mb-0">Brand color</div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative inline-flex h-12 w-12 cursor-pointer overflow-hidden rounded-2xl border border-white/15 shadow-[0_0_24px_-8px_rgba(52,211,153,0.55)] transition active:scale-95">
          <span className="absolute inset-0" style={{ background: hex }} />
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Pick brand color"
          />
          <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
        </label>

        <div className="min-w-0 flex-1">
          <input
            className="pp-input font-mono uppercase"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#10b981"
            maxLength={7}
          />
          <div className="mt-1 text-[11px] text-white/35">
            Opens a color wheel — or paste a hex value.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            className={`h-7 w-7 rounded-full border transition active:scale-90 ${
              hex.toLowerCase() === c.toLowerCase()
                ? "border-white scale-110"
                : "border-white/20 hover:border-white/50"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}
