"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCoins } from "@/lib/format";

export function BudgetCard({
  spent,
  weeklyLimit,
  shareBlowout,
}: {
  spent: number;
  weeklyLimit: number | null;
  shareBlowout: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [digits, setDigits] = useState(weeklyLimit ? String(weeklyLimit) : "");
  const [share, setShare] = useState(shareBlowout);
  const [busy, setBusy] = useState(false);

  const over = weeklyLimit != null && spent > weeklyLimit;
  const pct = weeklyLimit ? Math.min((spent / weeklyLimit) * 100, 100) : 0;

  async function save() {
    setBusy(true);
    const supabase = createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (!userId) return router.replace("/login");
    await supabase
      .from("budgets")
      .update({
        weekly_limit: parseInt(digits || "0", 10) || null,
        share_blowout: share,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    setEditing(false);
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="surface-card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-ink">Weekly budget</h2>
        <button
          onClick={() => setEditing((e) => !e)}
          className="font-mono text-xs text-neon-cyan"
        >
          {editing ? "close" : "edit"}
        </button>
      </div>

      {weeklyLimit == null && !editing && (
        <button
          onClick={() => setEditing(true)}
          className="rounded-pill border border-line bg-surface-2 py-2 text-sm text-ink-dim"
        >
          Set a weekly budget →
        </button>
      )}

      {weeklyLimit != null && (
        <>
          <div className="flex justify-between font-mono text-sm">
            <span className={over ? "text-over" : "text-ink"}>
              🪙{formatCoins(spent)}
            </span>
            <span className="text-ink-dim">/ {formatCoins(weeklyLimit)}</span>
          </div>
          <div className="h-3 rounded-pill bg-surface-2">
            <div
              className="h-full rounded-pill transition-all"
              style={{
                width: `${pct}%`,
                background: over
                  ? "var(--color-over)"
                  : "var(--color-neon-lime)",
              }}
            />
          </div>
          <p className="text-xs text-ink-dim">one-off spending this week</p>
          {over && (
            <p className="rounded-pill bg-over/10 px-3 py-2 text-center text-sm text-over">
              💸 Blowout! Over by 🪙{formatCoins(spent - weeklyLimit)}
              {shareBlowout ? " · your groups know 👀" : ""}
            </p>
          )}
        </>
      )}

      {editing && (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <label className="flex items-center justify-between text-sm text-ink-dim">
            Weekly limit
            <input
              inputMode="numeric"
              value={digits ? formatCoins(parseInt(digits, 10)) : ""}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
              placeholder="500,000"
              className="w-32 rounded-pill border border-line bg-surface-2 px-3 py-1.5 text-right font-mono text-ink outline-none"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-ink-dim">
            Share blowouts to groups
            <input
              type="checkbox"
              checked={share}
              onChange={(e) => setShare(e.target.checked)}
              className="h-5 w-5 accent-neon-pink"
            />
          </label>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-pill bg-neon-lime py-2.5 font-display font-bold text-void shadow-glow-lime active:scale-95 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save budget"}
          </button>
        </div>
      )}
    </section>
  );
}
