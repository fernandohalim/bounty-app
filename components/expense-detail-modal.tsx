"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categoryIcon, categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { CategorySelect } from "@/components/ui/category-select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { TextInput } from "./ui/text-input";
import { PixelIcon } from "./ui/pixel-icon";
import { Coins } from "./ui/coins";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  is_recurring: boolean;
  spent_at: string;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-dim">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

export function ExpenseDetailModal({
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
      <Modal onClose={onClose}>
        {!editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <PixelIcon
                name={categoryIcon(expense.category as Category)}
                size={30}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  {expense.note || m.label}
                </p>
                <p className="font-mono text-[11px] text-ink-dim">{m.label}</p>
              </div>
              <span className="font-mono text-lg font-bold text-neon-lime">
                <Coins amount={expense.amount} size={18} />
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
              <InfoRow
                label="Category"
                value={
                  <span className="inline-flex items-center gap-1">
                    <PixelIcon
                      name={categoryIcon(expense.category as Category)}
                      size={16}
                    />
                    {m.label}
                  </span>
                }
              />{" "}
              {expense.is_recurring && (
                <InfoRow label="Type" value="Recurring" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="accent"
                className="flex-1"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button variant="danger" onClick={() => setConfirmDel(true)}>
                Delete
              </Button>
            </div>
            {confirmDel && (
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  busy={busy}
                  className="flex-1"
                  onClick={remove}
                >
                  yes, delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmDel(false)}
                >
                  cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="surface-card flex items-center justify-center gap-2 py-4">
              <PixelIcon name="brand/coin" size={20} />
              <input
                inputMode="numeric"
                value={formatCoins(amount)}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
                className="min-w-0 flex-1 bg-transparent text-center font-mono text-3xl font-bold text-neon-lime outline-none"
              />
            </div>
            <CategorySelect value={category} onChange={setCategory} />
            <TextInput
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              maxLength={140}
            />
            <DateTimePicker
              value={when}
              onChange={setWhen}
              mode="datetime"
              label="When"
            />
            {err && <p className="text-center text-sm text-over">{err}</p>}
            <div className="flex gap-2">
              <Button
                variant="primary"
                busy={busy}
                disabled={amount <= 0}
                className="flex-1"
                onClick={save}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
