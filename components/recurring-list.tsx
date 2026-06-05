"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { CategorySelect } from "@/components/ui/category-select";
import { DateTimePicker } from "@/components/ui/datetime-picker";

type Template = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  cadence: string;
  next_occurrence: string;
};

export function RecurringList({ templates }: { templates: Template[] }) {
  const [selected, setSelected] = useState<Template | null>(null);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
        Recurring · {templates.length}
      </h2>
      {templates.map((t) => {
        const m = categoryMeta(t.category as Category);
        return (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className="surface-card flex w-full items-center gap-3 px-4 py-3 text-left active:scale-[0.99]"
          >
            <span className="text-2xl">{m.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{t.note || m.label}</p>
              <p className="font-mono text-[11px] text-ink-dim mt-0.5">
                <span className="rounded-pill bg-neon-violet/15 px-1.5 py-0.5 lowercase text-neon-violet">
                  {t.cadence}
                </span>{" "}
                · next {new Date(t.next_occurrence).toLocaleDateString()}
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-ink">
              🪙{formatCoins(t.amount)}
            </span>
          </button>
        );
      })}

      {selected && (
        <RecurringDetailModal
          template={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
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

function RecurringDetailModal({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  const router = useRouter();
  const m = categoryMeta(template.category as Category);
  const [editing, setEditing] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  const [digits, setDigits] = useState(String(template.amount));
  const [category, setCategory] = useState<Category>(
    template.category as Category,
  );
  const [note, setNote] = useState(template.note ?? "");
  const [cadence, setCadence] = useState<"weekly" | "monthly">(
    template.cadence === "weekly" ? "weekly" : "monthly",
  );
  const [when, setWhen] = useState<Date>(new Date(template.next_occurrence));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const amount = parseInt(digits || "0", 10);

  async function save() {
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("recurring_expenses")
      .update({
        amount,
        category,
        note: note.trim() || null,
        cadence,
        next_occurrence: when.toISOString().slice(0, 10),
      })
      .eq("id", template.id);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    onClose();
    router.refresh();
  }

  async function stop() {
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("recurring_expenses")
      .update({ active: false })
      .eq("id", template.id);
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
                  {template.note || m.label}
                </p>
                <p className="font-mono text-[11px] text-neon-violet">
                  recurring
                </p>
              </div>
              <span className="font-mono text-lg font-bold text-neon-lime">
                🪙{formatCoins(template.amount)}
              </span>
            </div>
            <div className="surface-card flex flex-col gap-1 p-3 text-sm">
              <InfoRow label="Category" value={`${m.emoji} ${m.label}`} />
              <InfoRow
                label="Repeats"
                value={template.cadence === "weekly" ? "Weekly" : "Monthly"}
              />
              <InfoRow
                label="Next charge"
                value={new Date(template.next_occurrence).toLocaleDateString(
                  [],
                  { day: "numeric", month: "short", year: "numeric" },
                )}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded-pill bg-neon-cyan py-2.5 font-display font-bold text-xl text-void shadow-glow-cyan active:scale-95 disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmStop(true)}
                className="rounded-pill border border-over/40 bg-over/10 px-4 py-2.5 text-xl font-display font-bold text-over active:scale-95"
              >
                Stop
              </button>
            </div>
            {confirmStop && (
              <div className="flex gap-2">
                <button
                  onClick={stop}
                  disabled={busy}
                  className="flex-1 rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-neon-cyan active:scale-95"
                >
                  yes, stop it
                </button>
                <button
                  onClick={() => setConfirmStop(false)}
                  className="flex-1 rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-neon-cyan active:scale-95"
                >
                  cancel
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
            <div className="flex rounded-pill border border-line bg-surface p-1">
              {(["weekly", "monthly"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={`flex-1 rounded-pill py-2 text-xs font-mono font-bold lowercase transition ${cadence === c ? "bg-neon-violet text-void" : "text-ink-dim"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <DateTimePicker
              value={when}
              onChange={setWhen}
              mode="date"
              label="Next charge"
            />
            {err && <p className="text-center text-sm text-over">{err}</p>}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={busy || amount <= 0}
                className="flex-2 rounded-pill bg-neon-lime py-2.5 font-display font-bold text-xl text-void shadow-glow-lime active:scale-95 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-pill border border-over/40 bg-over/10 px-4 py-2.5 text-xl font-display font-bold text-over active:scale-95"
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
