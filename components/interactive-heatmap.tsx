"use client";

import { useState } from "react";
import { formatCoins } from "@/lib/format";

type Day = { date: string; amount: number; level: number; future: boolean };

const HEAT = [
  "var(--color-surface-2)",
  "#1f3a1a",
  "#3f7a1f",
  "#7fbf26",
  "#c2ff48",
];

export function InteractiveHeatmap({ weeks }: { weeks: Day[][] }) {
  const [sel, setSel] = useState<Day | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {weeks.map((wk, i) => (
          <div key={i} className="flex flex-1 flex-col gap-1">
            {wk.map((d, j) =>
              d.future ? (
                <div key={j} className="aspect-square rounded-[3px]" />
              ) : (
                <button
                  type="button"
                  key={j}
                  onClick={() => setSel((c) => (c?.date === d.date ? null : d))}
                  className={`aspect-square rounded-[3px] transition ${
                    sel?.date === d.date ? "ring-2 ring-neon-cyan" : ""
                  }`}
                  style={{ background: HEAT[d.level] }}
                />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="flex min-h-5 items-center justify-between font-mono text-[10px] text-ink-dim">
        <span>
          {sel
            ? `${new Date(sel.date + "T00:00:00").toLocaleDateString()} · 🪙${formatCoins(sel.amount)}`
            : "tap a day for details"}
        </span>
        <span className="flex items-center gap-1">
          less
          {HEAT.map((c, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-xs"
              style={{ background: c }}
            />
          ))}
          more
        </span>
      </div>
    </div>
  );
}
