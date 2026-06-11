"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  categoryIcon,
  categoryMeta,
  type Category,
} from "@/lib/categories";
import {
  ExpenseDetailModal,
  type Expense,
} from "@/components/expense-detail-modal";
import { Select } from "./ui/select";
import { Coins } from "./ui/coins";
import { PixelIcon } from "./ui/pixel-icon";
export type { Expense };

type Sort = "newest" | "oldest" | "highest" | "lowest" | "az" | "za";

const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "highest", label: "Highest" },
  { id: "lowest", label: "Lowest" },
  { id: "az", label: "A–Z" },
  { id: "za", label: "Z–A" },
];

const labelOf = (e: Expense) =>
  (e.note || categoryMeta(e.category as Category).label).toLowerCase();
const dayKey = (iso: string) => new Date(iso).toLocaleDateString();
const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString([], {
    month: "short",
    year: "numeric",
  });
};
function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HistoryView({ expenses }: { expenses: Expense[] }) {
  const [month, setMonth] = useState("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [selected, setSelected] = useState<Expense | null>(null);

  const months = useMemo(
    () =>
      Array.from(new Set(expenses.map((e) => e.spent_at.slice(0, 7))))
        .sort()
        .reverse(),
    [expenses],
  );

  const filtered = useMemo(() => {
    let xs = expenses;
    if (month !== "all")
      xs = xs.filter((e) => e.spent_at.slice(0, 7) === month);
    if (cat !== "all") xs = xs.filter((e) => e.category === cat);
    const cmp: Record<Sort, (a: Expense, b: Expense) => number> = {
      newest: (a, b) => (a.spent_at < b.spent_at ? 1 : -1),
      oldest: (a, b) => (a.spent_at > b.spent_at ? 1 : -1),
      highest: (a, b) => b.amount - a.amount,
      lowest: (a, b) => a.amount - b.amount,
      az: (a, b) => labelOf(a).localeCompare(labelOf(b)),
      za: (a, b) => labelOf(b).localeCompare(labelOf(a)),
    };
    return [...xs].sort(cmp[sort]);
  }, [expenses, month, cat, sort]);

  const grouped = sort === "newest" || sort === "oldest";
  const groups = useMemo(() => {
    if (!grouped) return [] as [string, Expense[]][];
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const k = dayKey(e.spent_at);
      const arr = map.get(k);
      if (arr) arr.push(e);
      else map.set(k, [e]);
    }
    return Array.from(map.entries());
  }, [filtered, grouped]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const monthOpts = [
    { id: "all", label: "All months" },
    ...months.map((m) => ({ id: m, label: monthLabel(m) })),
  ];
  const catOpts = [
    { id: "all" as const, label: "All", icon: "ui/tag" },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      icon: categoryIcon(c.id),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Select value={month} options={monthOpts} onChange={setMonth} />
        <Select value={cat} options={catOpts} onChange={setCat} />
        <Select value={sort} options={SORTS} onChange={setSort} />
      </div>

      <p className="font-mono text-[11px] text-ink-dim">
        {filtered.length} {filtered.length === 1 ? "expense" : "expenses"} ·
        <Coins amount={total} size={13} />
      </p>

      {filtered.length === 0 ? (
        <div className="surface-card px-6 py-10 text-center text-sm font-mono text-ink-dim">
          nothing matches these filters.
        </div>
      ) : grouped ? (
        groups.map(([k, items]) => (
          <div key={k} className="flex flex-col gap-2">
            <h3 className="font-mono text-xs uppercase tracking-widest text-ink-dim mb-1">
              {dayLabel(items[0].spent_at)}
            </h3>
            {items.map((e) => (
              <Row key={e.id} e={e} onTap={() => setSelected(e)} />
            ))}
          </div>
        ))
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e) => (
            <Row key={e.id} e={e} onTap={() => setSelected(e)} />
          ))}
        </div>
      )}

      {selected && (
        <ExpenseDetailModal
          expense={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Row({ e, onTap }: { e: Expense; onTap: () => void }) {
  const m = categoryMeta(e.category as Category);
  return (
    <button
      onClick={onTap}
      className="surface-card flex w-full items-center gap-3 px-4 py-3 text-left active:scale-[0.99]"
    >
      <PixelIcon name={categoryIcon(e.category as Category)} size={24} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink">{e.note || m.label}</p>
        <p className="font-mono text-[11px] text-ink-dim">
          {new Date(e.spent_at).toLocaleString([], {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {e.is_recurring && (
            <span className="ml-2 rounded-pill bg-neon-violet/15 px-1.5 py-0.5 text-neon-violet">
              recurring
            </span>
          )}
        </p>
      </div>
      <span className="font-mono text-sm font-bold text-ink">
        <Coins amount={e.amount} size={14} />
      </span>
    </button>
  );
}
