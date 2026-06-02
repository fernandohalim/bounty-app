import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import { RecurringList } from "@/components/recurring-list";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, category, note, is_recurring, spent_at")
    .order("spent_at", { ascending: false })
    .limit(100);

  const { data: recurring } = await supabase
    .from("recurring_expenses")
    .select("id, amount, category, note, cadence, next_occurrence")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-col gap-6 px-5 pt-8">
      <h1 className="font-display text-2xl font-bold text-ink">History</h1>

      {recurring && recurring.length > 0 && (
        <RecurringList templates={recurring} />
      )}

      <div className="flex flex-col gap-2">
        {(expenses ?? []).length === 0 && (
          <div className="surface-card px-6 py-10 text-center">
            <p className="text-sm text-ink-dim">
              No expenses yet. Tap the + to log one.
            </p>
          </div>
        )}
        {(expenses ?? []).map((e) => {
          const m = categoryMeta(e.category as Category);
          return (
            <Link
              key={e.id}
              href={`/expenses/${e.id}`}
              className="surface-card flex items-center gap-3 px-4 py-3"
            >
              <span className="text-2xl">{m.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{e.note || m.label}</p>
                <p className="font-mono text-[11px] text-ink-dim">
                  {new Date(e.spent_at).toLocaleDateString()}
                  {e.is_recurring && (
                    <span className="ml-2 rounded-pill bg-neon-violet/15 px-1.5 py-0.5 text-neon-violet">
                      recurring
                    </span>
                  )}
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-ink">
                © {formatCoins(e.amount)}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
