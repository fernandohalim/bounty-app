"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { CategorySelect } from "@/components/ui/category-select";
import { DateTimePicker } from "@/components/ui/datetime-picker";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  is_recurring: boolean;
  spent_at: string;
};

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
    { id: "all" as const, label: "All", emoji: "🏷️" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Dropdown value={month} options={monthOpts} onChange={setMonth} />
        <Dropdown value={cat} options={catOpts} onChange={setCat} />
        <Dropdown value={sort} options={SORTS} onChange={setSort} />
      </div>

      <p className="font-mono text-[11px] text-ink-dim">
        {filtered.length} {filtered.length === 1 ? "expense" : "expenses"} · 🪙
        {formatCoins(total)}
      </p>

      {filtered.length === 0 ? (
        <div className="surface-card px-6 py-10 text-center text-sm text-ink-dim">
          Nothing matches these filters.
        </div>
      ) : grouped ? (
        groups.map(([k, items]) => (
          <div key={k} className="flex flex-col gap-2">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
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
        <DetailModal expense={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function Dropdown<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string; emoji?: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.id === value) ?? options[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-2 text-xs text-ink"
      >
        {cur.emoji && <span>{cur.emoji}</span>}
        {cur.label}
        <span className="text-ink-dim">⌄</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full z-20 mt-1 max-h-60 w-max min-w-full overflow-y-auto rounded-card border border-line bg-surface-2 p-1 shadow-card">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs ${o.id === value ? "bg-surface text-ink" : "text-ink-dim active:bg-surface"}`}
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

function Row({ e, onTap }: { e: Expense; onTap: () => void }) {
  const m = categoryMeta(e.category as Category);
  return (
    <button
      onClick={onTap}
      className="surface-card flex w-full items-center gap-3 px-4 py-3 text-left active:scale-[0.99]"
    >
      <span className="text-2xl">{m.emoji}</span>
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
        🪙{formatCoins(e.amount)}
      </span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-dim">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function DetailModal({
  expense,
  onClose,
}: {
  expense: Expense;
  onClose: () => void;
}) {
  const router = useRouter();
  const m = categoryMeta(expense.category as Category);
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [digits, setDigits] = useState(String(expense.amount));
  const [category, setCategory] = useState<Category>(
    expense.category as Category,
  );
  const [note, setNote] = useState(expense.note ?? "");
  const [when, setWhen] = useState<Date>(new Date(expense.spent_at));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const amount = parseInt(digits || "0", 10);

  async function save() {
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("expenses")
      .update({
        amount,
        category,
        note: note.trim() || null,
        spent_at: when.toISOString(),
      })
      .eq("id", expense.id);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    onClose();
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", expense.id);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-void/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-pop-in relative z-10 w-full max-w-md rounded-t-card border border-line bg-surface p-5 sm:rounded-card">
        {!editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{m.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  {expense.note || m.label}
                </p>
                <p className="font-mono text-[11px] text-ink-dim">{m.label}</p>
              </div>
              <span className="font-mono text-lg font-bold text-neon-lime">
                🪙{formatCoins(expense.amount)}
              </span>
            </div>
            <div className="surface-card flex flex-col gap-1 p-3 text-sm">
              <InfoRow
                label="When"
                value={new Date(expense.spent_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
              <InfoRow label="Category" value={`${m.emoji} ${m.label}`} />
              {expense.is_recurring && (
                <InfoRow label="Type" value="Recurring" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded-pill bg-neon-cyan py-2.5 font-display font-bold text-void shadow-glow-cyan active:scale-95"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDel(true)}
                className="rounded-pill border border-over/40 bg-over/10 px-4 py-2.5 font-semibold text-over active:scale-95"
              >
                Delete
              </button>
            </div>
            {confirmDel && (
              <div className="flex gap-2">
                <button
                  onClick={remove}
                  disabled={busy}
                  className="flex-1 rounded-pill bg-over py-2.5 font-bold text-void active:scale-95 disabled:opacity-50"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="flex-1 rounded-pill border border-line py-2.5 text-ink"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="surface-card flex items-center justify-center gap-2 py-4">
              <span className="text-xl">🪙</span>
              <input
                inputMode="numeric"
                value={formatCoins(amount)}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
                className="w-40 bg-transparent text-center font-mono text-3xl font-bold text-neon-lime outline-none"
              />
            </div>
            <CategorySelect value={category} onChange={setCategory} />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              maxLength={140}
              className="rounded-pill border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-dim/50"
            />
            <DateTimePicker
              value={when}
              onChange={setWhen}
              mode="datetime"
              label="When"
            />
            {err && <p className="text-center text-sm text-over">{err}</p>}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={busy || amount <= 0}
                className="flex-1 rounded-pill bg-neon-lime py-2.5 font-display font-bold text-void shadow-glow-lime active:scale-95 disabled:opacity-40"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-pill border border-line px-4 py-2.5 text-ink"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
