"use client";

import { useState } from "react";
import { formatCoins } from "@/lib/format";
import { categoryIcon, type Category } from "@/lib/categories";
import { Eyebrow } from "./ui/eyebrow";
import { Coins } from "./ui/coins";
import { PixelIcon } from "./ui/pixel-icon";

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
          <Eyebrow as="span" className="mb-1">
            {sel ? sel.label : "Total this month"}
          </Eyebrow>
          <span className="font-mono text-2xl font-bold text-neon-lime">
            <Coins amount={sel ? sel.value : total} size={22} />
          </span>
        </div>
        {sel && total > 0 && (
          <span className="rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-neon-cyan active:scale-95">
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
                <PixelIcon name={categoryIcon(sel.id)} size={20} />
                <span className="mt-0.5 font-mono text-xs font-bold text-ink">
                  {Math.round((sel.value / total) * 100)}%
                </span>
              </>
            ) : (
              <span className="px-2 text-center font-mono text-[10px] text-ink-dim">
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
                <span className="flex w-5 justify-center">
                  <PixelIcon name={categoryIcon(it.id)} size={18} />
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className={on ? "text-ink" : "text-ink-dim"}>
                      {it.label}
                    </span>
                    <span className="font-mono text-ink">
                      <Coins amount={it.value} size={13} />
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
