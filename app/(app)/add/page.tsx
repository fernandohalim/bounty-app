"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { enqueue } from "@/lib/offline-queue";

type Mode = "oneoff" | "recurring";
const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "000", "0", "del"];

export default function AddPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("oneoff");
  const [digits, setDigits] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [cadence, setCadence] = useState<"weekly" | "monthly">("monthly");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const amount = parseInt(digits || "0", 10);
  const canSave = amount > 0 && !!category && !saving;

  function press(key: string) {
    setErr(null);
    if (key === "del") return setDigits((d) => d.slice(0, -1));
    if (key === "000")
      return setDigits((d) => (d === "" ? "" : (d + "000").slice(0, 12)));
    setDigits((d) => (d === "" && key === "0" ? "" : (d + key).slice(0, 12)));
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setErr(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.replace("/login");

    const clientUuid = crypto.randomUUID();
    const base = {
      user_id: user.id,
      amount,
      category: category!,
      note: note.trim() || null,
    };

    // Offline: queue one-offs locally; recurring needs a connection.
    if (!navigator.onLine) {
      if (mode === "recurring") {
        setErr("You're offline — scheduling needs a connection.");
        setSaving(false);
        return;
      }
      await enqueue({ client_uuid: clientUuid, ...base });
      router.push("/expenses");
      router.refresh();
      return;
    }

    const { error } =
      mode === "oneoff"
        ? await supabase
            .from("expenses")
            .insert({ ...base, client_uuid: clientUuid })
        : await supabase
            .from("recurring_expenses")
            .insert({ ...base, cadence, next_occurrence: startDate });

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <main className="flex flex-col gap-5 px-5 pb-6 pt-6">
      {/* mode switch */}
      <div className="flex rounded-pill border border-line bg-surface p-1">
        {(["oneoff", "recurring"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-pill py-2 text-sm font-semibold transition ${
              mode === m ? "bg-neon-cyan text-void" : "text-ink-dim"
            }`}
          >
            {m === "oneoff" ? "One-off" : "Recurring"}
          </button>
        ))}
      </div>

      {/* amount */}
      <div className="surface-card flex items-center justify-center gap-2 py-6">
        <span className="text-2xl">©</span>
        <span className="font-mono text-4xl font-bold text-neon-lime">
          {formatCoins(amount)}
        </span>
      </div>

      {/* categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={
                on
                  ? {
                      borderColor: c.accent,
                      boxShadow: `0 0 16px -4px ${c.accent}`,
                    }
                  : {}
              }
              className={`flex items-center gap-1.5 rounded-pill border px-3 py-2 text-sm transition ${
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

      {/* note */}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)"
        maxLength={140}
        className="rounded-pill border border-line bg-surface px-4 py-2.5 text-ink outline-none placeholder:text-ink-dim/50"
      />

      {/* recurring extras */}
      {mode === "recurring" && (
        <div className="flex flex-col gap-3">
          <div className="flex rounded-pill border border-line bg-surface p-1">
            {(["weekly", "monthly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={`flex-1 rounded-pill py-2 text-sm font-semibold capitalize transition ${
                  cadence === c ? "bg-neon-violet text-void" : "text-ink-dim"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between rounded-pill border border-line bg-surface px-4 py-2 text-sm text-ink-dim">
            Starts
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-ink outline-none"
            />
          </label>
        </div>
      )}

      {/* silent keypad */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="rounded-card border border-line bg-surface py-4 font-mono text-xl font-bold text-ink transition active:scale-95 active:bg-surface-2"
          >
            {k === "del" ? "⌫" : k}
          </button>
        ))}
      </div>

      {err && <p className="text-center text-sm text-over">{err}</p>}

      <button
        onClick={save}
        disabled={!canSave}
        className="rounded-pill bg-neon-lime py-3.5 font-display font-bold text-void shadow-glow-lime transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
      >
        {saving ? "Saving…" : mode === "oneoff" ? "Log it →" : "Schedule it →"}
      </button>
    </main>
  );
}
