"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCoins } from "@/lib/format";
import { Button } from "./ui/button";
import { Eyebrow } from "./ui/eyebrow";
import { Coins } from "./ui/coins";
import { PixelIcon } from "./ui/pixel-icon";

export function BudgetCard({
  spent,
  weeklyLimit,
}: {
  spent: number;
  weeklyLimit: number | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [digits, setDigits] = useState(weeklyLimit ? String(weeklyLimit) : "");
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
        <h2 className="font-display font-bold text-ink text-xl">
          Weekly budget
        </h2>
        <Button variant="chip" size="sm" onClick={() => setEditing((e) => !e)}>
          {editing ? "close" : "edit"}
        </Button>
      </div>

      {weeklyLimit == null && !editing && (
        <Button variant="chip" size="sm" onClick={() => setEditing(true)}>
          set a weekly budget
        </Button>
      )}

      {weeklyLimit != null && (
        <>
          <div className="flex justify-between font-mono text-sm">
            <span className={over ? "text-over" : "text-ink"}>
              <Coins amount={spent} size={14} />
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
          <p
            className="font-mono text-[10px] text-ink-dim
"
          >
            one-off spending this week
          </p>
          {over && (
            <p className="flex items-center gap-1 rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs active:scale-95 text-over">
              <PixelIcon name="ui/blowout" size={14} /> Blowout! Over by{" "}
              <Coins amount={spent - weeklyLimit} size={13} />
            </p>
          )}
        </>
      )}

      {editing && (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <Eyebrow as="label" className="flex items-center justify-between">
            Weekly limit
            <input
              inputMode="numeric"
              value={digits ? formatCoins(parseInt(digits, 10)) : ""}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
              placeholder="500,000"
              className="w-32 rounded-pill border border-line bg-surface-2 px-3 py-1.5 text-right font-mono text-ink outline-none"
            />
          </Eyebrow>
          <Button variant="primary" busy={busy} fullWidth onClick={save}>
            {busy ? "Saving…" : "Save budget"}
          </Button>
        </div>
      )}
    </section>
  );
}
