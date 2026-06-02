"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";

type Template = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  cadence: string;
  next_occurrence: string;
};

export function RecurringList({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function stop(id: string) {
    setBusy(id);
    const supabase = createClient();
    await supabase
      .from("recurring_expenses")
      .update({ active: false })
      .eq("id", id);
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
        Recurring · {templates.length}
      </h2>
      {templates.map((t) => {
        const m = categoryMeta(t.category as Category);
        return (
          <div
            key={t.id}
            className="surface-card flex items-center gap-3 px-4 py-3"
          >
            <span className="text-2xl">{m.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{t.note || m.label}</p>
              <p className="font-mono text-[11px] text-ink-dim">
                {t.cadence} · next{" "}
                {new Date(t.next_occurrence).toLocaleDateString()}
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-ink">
              © {formatCoins(t.amount)}
            </span>
            <button
              onClick={() => stop(t.id)}
              disabled={busy === t.id}
              className="rounded-pill border border-over/40 px-3 py-1 text-xs text-over transition active:scale-95 disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        );
      })}
    </section>
  );
}
