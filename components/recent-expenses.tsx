"use client";

import { useState } from "react";
import { categoryIcon, categoryMeta, type Category } from "@/lib/categories";
import {
  ExpenseDetailModal,
  type Expense,
} from "@/components/expense-detail-modal";
import { Eyebrow } from "./ui/eyebrow";
import { PixelIcon } from "./ui/pixel-icon";
import { Coins } from "./ui/coins";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  const [selected, setSelected] = useState<Expense | null>(null);
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-3">
      <Eyebrow as="span">Recent</Eyebrow>
      {expenses.map((e) => {
        const m = categoryMeta(e.category as Category);
        return (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="flex items-center gap-3 text-left"
          >
            <PixelIcon name={categoryIcon(e.category as Category)} size={20} />
            <span className="flex-1 truncate text-sm text-ink">
              {e.note || m.label}
            </span>
            <span className="font-mono text-sm font-bold text-ink">
              <Coins amount={e.amount} size={14} />
            </span>
          </button>
        );
      })}
      {selected && (
        <ExpenseDetailModal
          expense={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
