"use client";

import { useState } from "react";
import { formatCoins } from "@/lib/format";
import type { Category } from "@/lib/categories";

type Item = {
  id: Category;
  label: string;
  emoji: string;
  value: number;
  accent: string;
};

export function CategoryChart({
  items,
  total,
}: {
  items: Item[];
  total: number;
}) {
  const [selected, setSelected] = useState<Category | null>(null);
  const max = items[0]?.value ?? 0;

  let acc = 0;
  const stops =
    total > 0
      ? items
          .map((it) => {
            const pct = (it.value / total) * 100;
            const color =
              selected && selected !== it.id ? `${it.accent}33` : it.accent;
            const seg = `${color} ${acc}% ${acc + pct}%`;
            acc += pct;
            return seg;
          })
          .join(", ")
      : "var(--color-surface-2) 0% 100%";

  const sel = items.find((i) => i.id === selected) ?? null;
  const toggle = (id: Category) =>
    setSelected((cur) => (cur === id ? null : id));

  return (
    <div className="flex flex-col gap-4">
      {/* total — now outside the donut */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
            {sel ? sel.label : "Total this month"}
          </span>
          <span className="font-mono text-2xl font-bold text-neon-lime">
            🪙{formatCoins(sel ? sel.value : total)}
          </span>
        </div>
        {sel && total > 0 && (
          <span className="rounded-pill bg-surface-2 px-2.5 py-1 font-mono text-xs text-neon-cyan">
            {Math.round((sel.value / total) * 100)}% of spend
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* donut */}
        <button
          type="button"
          onClick={() => setSelected(null)}
          aria-label="Clear selection"
          className="relative h-32 w-32 shrink-0"
        >
          <div
            className="h-full w-full rounded-full transition-[background] duration-300"
            style={{ background: `conic-gradient(${stops})` }}
          />
          <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full bg-surface shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
            {sel ? (
              <>
                <span className="text-lg leading-none">{sel.emoji}</span>
                <span className="mt-0.5 font-mono text-xs font-bold text-ink">
                  {Math.round((sel.value / total) * 100)}%
                </span>
              </>
            ) : (
              <span className="px-2 text-center font-mono text-[9px] leading-tight text-ink-dim">
                tap a slice
              </span>
            )}
          </div>
        </button>

        {/* legend */}
        <div className="flex flex-1 flex-col gap-2.5">
          {items.map((it) => {
            const on = selected === it.id;
            const dim = selected && !on;
            return (
              <button
                type="button"
                key={it.id}
                onClick={() => toggle(it.id)}
                className={`flex items-center gap-2 text-left transition active:scale-[0.99] ${dim ? "opacity-40" : "opacity-100"}`}
              >
                <span className="w-5 text-center text-sm">{it.emoji}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className={on ? "text-ink" : "text-ink-dim"}>
                      {it.label}
                    </span>
                    <span className="font-mono text-ink">
                      🪙{formatCoins(it.value)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-pill bg-surface-2">
                    <div
                      className="h-full rounded-pill transition-all duration-300"
                      style={{
                        width: `${max > 0 ? (it.value / max) * 100 : 0}%`,
                        background: it.accent,
                        boxShadow: on ? `0 0 10px -2px ${it.accent}` : "none",
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center font-mono text-[10px] text-ink-dim">
        {selected ? "tap the center to clear" : "tap a slice or bar to focus"}
      </p>
    </div>
  );
}
