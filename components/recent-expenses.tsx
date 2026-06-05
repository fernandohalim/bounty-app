"use client";

import { useState } from "react";
import { categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import {
  ExpenseDetailModal,
  type Expense,
} from "@/components/expense-detail-modal";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  const [selected, setSelected] = useState<Expense | null>(null);
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-3">
      <span className="font-mono text-xs uppercase tracking-widest text-ink-dim">
        Recent
      </span>
      {expenses.map((e) => {
        const m = categoryMeta(e.category as Category);
        return (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="flex items-center gap-3 text-left"
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="flex-1 truncate text-sm text-ink">
              {e.note || m.label}
            </span>
            <span className="font-mono text-sm font-bold text-ink">
              🪙{formatCoins(e.amount)}
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
