"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { DateTimePicker } from "@/components/ui/datetime-picker";

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [digits, setDigits] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [note, setNote] = useState("");
  const [when, setWhen] = useState<Date>(() => new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("expenses")
        .select("amount, category, note, spent_at, is_recurring")
        .eq("id", id)
        .single();
      if (data) {
        setDigits(String(data.amount));
        setCategory(data.category as Category);
        setNote(data.note ?? "");
        setWhen(new Date(data.spent_at));
        setIsRecurring(data.is_recurring);
      }
      setLoading(false);
    })();
  }, [id]);

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
      .eq("id", id);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", id);
    router.push("/expenses");
    router.refresh();
  }

  if (loading)
    return (
      <main className="px-5 pt-10 text-center text-ink-dim">Loading…</main>
    );

  return (
    <main className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <h1 className="font-display text-xl font-bold text-ink">
        Edit expense{" "}
        {isRecurring && (
          <span className="text-sm text-neon-violet">· recurring</span>
        )}
      </h1>

      <div className="surface-card flex items-center justify-center gap-2 py-5">
        <span className="text-xl">©</span>
        <input
          inputMode="numeric"
          value={formatCoins(amount)}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
          className="w-40 bg-transparent text-center font-mono text-3xl font-bold text-neon-lime outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={on ? { borderColor: c.accent } : {}}
              className={`flex items-center gap-1.5 rounded-pill border px-3 py-2 text-sm ${
                on
                  ? "bg-surface-2 text-ink"
                  : "border-line bg-surface text-ink-dim"
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

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

      <button
        onClick={save}
        disabled={busy || amount <= 0}
        className="rounded-pill bg-neon-lime py-3.5 font-display font-bold text-void shadow-glow-lime transition active:scale-95 disabled:opacity-40"
      >
        Save changes
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-pill border border-over/40 bg-over/10 py-3 font-semibold text-over transition active:scale-95"
      >
        Delete
      </button>
    </main>
  );
}
