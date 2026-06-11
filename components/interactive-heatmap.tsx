"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, categoryIcon, type Category } from "@/lib/categories";
import { Select } from "./ui/select";
import { Coins } from "./ui/coins";

type Day = {
  date: string;
  byCat: Partial<Record<Category, number>>;
  future: boolean;
};

const HEAT = [
  "var(--color-surface-2)",
  "#1f3a1a",
  "#3f7a1f",
  "#7fbf26",
  "#c2ff48",
];

export function InteractiveHeatmap({ weeks }: { weeks: Day[][] }) {
  const [selDate, setSelDate] = useState<string | null>(null);
  const [cat, setCat] = useState<Category | "all">("all");

  const { computed, maxDay } = useMemo(() => {
    const computed = weeks.map((wk) =>
      wk.map((d) => {
        const amount =
          cat === "all"
            ? Object.values(d.byCat).reduce<number>((s, n) => s + (n ?? 0), 0)
            : (d.byCat[cat] ?? 0);
        return { date: d.date, future: d.future, amount };
      }),
    );
    const maxDay = computed
      .flat()
      .reduce((m, d) => (!d.future && d.amount > m ? d.amount : m), 1);
    return { computed, maxDay };
  }, [weeks, cat]);

  const level = (amount: number) =>
    amount === 0 ? 0 : Math.min(4, 1 + Math.floor((amount / maxDay) * 3.999));

  const selDay = selDate
    ? (computed.flat().find((d) => d.date === selDate) ?? null)
    : null;

  const catOpts = [
    { id: "all" as const, label: "All categories", icon: "ui/tag" },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      icon: categoryIcon(c.id),
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <Select value={cat} options={catOpts} onChange={setCat} />

      <div className="flex gap-1">
        {computed.map((wk, i) => (
          <div key={i} className="flex flex-1 flex-col gap-1">
            {wk.map((d, j) =>
              d.future ? (
                <div key={j} className="aspect-square rounded-[3px]" />
              ) : (
                <button
                  type="button"
                  key={j}
                  onClick={() =>
                    setSelDate((c) => (c === d.date ? null : d.date))
                  }
                  className={`aspect-square rounded-[3px] transition ${
                    selDate === d.date ? "ring-2 ring-neon-cyan" : ""
                  }`}
                  style={{ background: HEAT[level(d.amount)] }}
                />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="flex min-h-5 items-center justify-between font-mono text-[10px] text-ink-dim">
        <span>
          {selDay ? (
            <span className="inline-flex items-center gap-1">
              {new Date(selDay.date + "T00:00:00").toLocaleDateString()} ·
              <Coins amount={selDay.amount} size={13} />
            </span>
          ) : (
            "tap a day for details"
          )}
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
