import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecurringList } from "@/components/recurring-list";
import { getUserId } from "@/lib/supabase/user";
import { HistoryView, type Expense } from "@/components/history-view";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, category, note, is_recurring, spent_at")
    .order("spent_at", { ascending: false })
    .limit(500);

  const { data: recurring } = await supabase
    .from("recurring_expenses")
    .select("id, amount, category, note, cadence, next_occurrence")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-col gap-6 px-5 pt-8">
      <h1 className="font-display font-bold text-ink text-3xl">History</h1>

      {recurring && recurring.length > 0 && (
        <RecurringList templates={recurring} />
      )}

      <HistoryView expenses={(expenses ?? []) as Expense[]} />
    </main>
  );
}
