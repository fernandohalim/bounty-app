"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, categoryMeta, type Category } from "@/lib/categories";

export function CategorySelect({
  value,
  onChange,
}: {
  value: Category | null;
  onChange: (c: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const m = value ? categoryMeta(value) : null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={m ? { borderColor: m.accent } : {}}
        className={`flex w-full items-center gap-2 rounded-pill border bg-surface px-4 py-2.5 text-sm transition ${m ? "text-ink" : "border-line text-ink-dim"}`}
      >
        <span className="text-lg">{m ? m.emoji : "🏷️"}</span>
        <span className="flex-1 text-left">
          {m ? m.label : "Pick a category"}
        </span>
        <span
          className={`text-ink-dim transition-transform ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="no-scrollbar absolute top-full z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-card border border-line bg-surface-2 p-1 shadow-card">
          {" "}
          {CATEGORIES.map((c) => {
            const on = value === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                style={on ? { boxShadow: `inset 0 0 0 1px ${c.accent}` } : {}}
                className={`flex w-full items-center gap-2 rounded-pill px-3 py-2 text-sm transition ${on ? "bg-surface text-ink" : "text-ink-dim active:bg-surface"}`}
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="flex-1 text-left">{c.label}</span>
                {on && <span style={{ color: c.accent }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
