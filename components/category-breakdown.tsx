"use client";

import { useState } from "react";
import { CategoryChart } from "@/components/category-chart";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import type { Category } from "@/lib/categories";

type Item = {
  id: Category;
  label: string;
  emoji: string;
  value: number;
  accent: string;
};
type Period = { items: Item[]; total: number };

export function CategoryBreakdown({
  week,
  month,
}: {
  week: Period;
  month: Period;
}) {
  const [period, setPeriod] = useState<"week" | "month">("month");
  const data = period === "week" ? week : month;

  return (
    <section className="surface-card flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display font-bold text-ink text-xl">By category</h2>
        <SegmentedToggle
          value={period}
          onChange={setPeriod}
          options={[
            { id: "week", label: "week" },
            { id: "month", label: "month" },
          ]}
        />
      </div>
      {data.total === 0 ? (
        <p className="py-6 text-center text-sm text-ink-dim">
          Nothing logged this {period} yet.
        </p>
      ) : (
        <CategoryChart items={data.items} total={data.total} />
      )}
    </section>
  );
}
