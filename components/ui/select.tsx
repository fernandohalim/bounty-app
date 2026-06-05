// components/ui/select.tsx  (NEW FILE)
"use client";

import { useState } from "react";

type Tone = "surface" | "surface2";
type Size = "sm" | "md";

const tones: Record<Tone, string> = {
  surface: "bg-surface",
  surface2: "bg-surface-2",
};
const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export function Select<T extends string>({
  value,
  options,
  onChange,
  tone = "surface",
  size = "sm",
  fullWidth = false,
}: {
  value: T;
  options: { id: T; label: string; emoji?: string }[];
  onChange: (v: T) => void;
  tone?: Tone;
  size?: Size;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.id === value) ?? options[0];
  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-pill border border-line text-ink ${tones[tone]} ${sizes[size]} ${
          fullWidth ? "w-full justify-between" : ""
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {cur?.emoji && <span>{cur.emoji}</span>}
          {cur?.label}
        </span>
        <span className="text-ink-dim">⌄</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`no-scrollbar absolute top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-card border border-line bg-surface-2 p-1 shadow-card ${
              fullWidth ? "w-full" : "w-max min-w-full"
            }`}
          >
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs ${
                  o.id === value
                    ? "bg-surface text-ink"
                    : "text-ink-dim active:bg-surface"
                }`}
              >
                {o.emoji && <span>{o.emoji}</span>}
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
