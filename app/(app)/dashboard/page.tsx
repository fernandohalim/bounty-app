import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type Category } from "@/lib/categories";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { Coins } from "@/components/ui/coins";
import { RecentExpenses } from "@/components/recent-expenses";
import {
  localDate,
  addDays,
  weekStart,
  daysAgoISO,
  todayLocal,
} from "@/lib/metrics";
import { avatarIcon } from "@/lib/avatars";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { InteractiveHeatmap } from "@/components/interactive-heatmap";
import { BudgetCard } from "@/components/budget-card";
import { getUserId } from "@/lib/supabase/user";
import { Stat } from "@/components/ui/stat";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LinkButton } from "@/components/ui/link-button";

export default async function Dashboard() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_id, level, xp, current_streak, timezone")
    .eq("id", userId)
    .single();
  const tz = profile?.timezone ?? "Asia/Jakarta";

  const { data: budget } = await supabase
    .from("budgets")
    .select("weekly_limit")
    .eq("user_id", userId)
    .maybeSingle();

  const cutoff = daysAgoISO(95);
  const { data: rows } = await supabase
    .from("expenses")
    .select("id, amount, category, note, is_recurring, spent_at")
    .gte("spent_at", cutoff);

  const exps = (rows ?? []).map((r) => ({
    ...r,
    day: localDate(r.spent_at, tz),
  }));

  const today = todayLocal(tz);

  const recent = exps
    .filter((e) => e.day === today)
    .sort((a, b) => (a.spent_at < b.spent_at ? 1 : -1))
    .slice(0, 5);

  const monthKey = today.slice(0, 7);
  const wkStart = weekStart(today);

  const sum = (xs: { amount: number }[]) =>
    xs.reduce((s, e) => s + e.amount, 0);

  const todayTotal = sum(exps.filter((e) => e.day === today));
  const todayCount = exps.filter((e) => e.day === today).length;
  const weekOneOff = sum(
    exps.filter((e) => e.day >= wkStart && !e.is_recurring),
  );

  const monthExps = exps.filter((e) => e.day.startsWith(monthKey));
  const monthTotal = sum(monthExps);

  const buildCatItems = (xs: typeof exps) => {
    const totals = new Map<Category, number>();
    for (const e of xs)
      totals.set(
        e.category as Category,
        (totals.get(e.category as Category) ?? 0) + e.amount,
      );
    return CATEGORIES.map((c) => ({ ...c, value: totals.get(c.id) ?? 0 }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const weekExps = exps.filter((e) => e.day >= wkStart);
  const weekItems = buildCatItems(weekExps);
  const weekTotal = sum(weekExps);
  const monthItems = buildCatItems(monthExps);

  // heatmap: 12 weeks ending the current week. Keep per-category daily totals
  // so the category filter + color intensity recompute client-side.
  const dayCatTotals = new Map<string, Map<Category, number>>();
  for (const e of exps) {
    let m = dayCatTotals.get(e.day);
    if (!m) {
      m = new Map();
      dayCatTotals.set(e.day, m);
    }
    const c = e.category as Category;
    m.set(c, (m.get(c) ?? 0) + e.amount);
  }
  const startMon = addDays(wkStart, -11 * 7);
  const weeks = Array.from({ length: 12 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(startMon, w * 7 + d);
      const catMap = dayCatTotals.get(date);
      const byCat: Partial<Record<Category, number>> = {};
      if (catMap) for (const [c, amt] of catMap) byCat[c] = amt;
      return { date, byCat, future: date > today };
    }),
  );

  return (
    <main className="flex flex-col gap-5 px-5 pb-4 pt-8">
      {/* header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-card border border-line bg-surface-2">
            <PixelIcon name={avatarIcon(profile?.avatar_id)} size={28} />
          </span>
          <div>
            <Eyebrow as="p">WELCOME BACK</Eyebrow>
            <h1 className="font-display text-3xl font-bold text-ink">
              {profile?.display_name}
            </h1>
          </div>
        </div>
      </header>

      {/* stat card */}
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Level"
          value={profile?.level ?? 1}
          accent="text-neon-cyan"
        />
        <Stat label="XP" value={profile?.xp ?? 0} accent="text-neon-lime" />
        <Stat
          label="Streak"
          value={
            <span className="inline-flex items-center gap-1">
              {profile?.current_streak ?? 0}
              <PixelIcon name="reactions/fire" size={18} />
            </span>
          }
          accent="text-gold"
        />
      </div>

      {/* today sect */}
      <section className="surface-card flex flex-col gap-4 p-5">
        {/* title + history on one row, so the amount can use the full card width */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-ink text-xl">
              Today
            </span>
            <LinkButton href="/expenses" variant="chip" size="sm">
              history
            </LinkButton>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-3xl font-bold text-neon-cyan">
              <Coins amount={todayTotal} size={26} />
            </span>
            <span className="font-mono text-[10px] text-ink-dim mt-1">
              {todayCount === 0
                ? "nothing logged yet"
                : `${todayCount} ${todayCount === 1 ? "expense" : "expenses"} today`}
            </span>
          </div>
        </div>

        {recent.length > 0 && <RecentExpenses expenses={recent} />}
      </section>

      {/* weekly budget card */}
      <BudgetCard
        spent={weekOneOff}
        weeklyLimit={budget?.weekly_limit ?? null}
      />

      {/* category breakdown — week / month toggle */}
      <CategoryBreakdown
        week={{ items: weekItems, total: weekTotal }}
        month={{ items: monthItems, total: monthTotal }}
      />

      {/* heatmap sect */}
      <section className="surface-card flex flex-col gap-3 p-5">
        <h2 className="font-display font-bold text-ink text-xl">
          Spending heatmap
        </h2>
        <InteractiveHeatmap weeks={weeks} />
      </section>
    </main>
  );
}
