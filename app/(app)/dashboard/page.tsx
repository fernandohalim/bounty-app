import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, categoryMeta, type Category } from "@/lib/categories";
import { formatCoins } from "@/lib/format";
import {
  localDate,
  addDays,
  weekStart,
  daysAgoISO,
  todayLocal,
} from "@/lib/metrics";
import { avatarEmoji } from "@/lib/avatars";
import { Donut, BarList, Heatmap } from "@/components/dashboard-charts";
import { BudgetCard } from "@/components/budget-card";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_id, level, xp, current_streak, timezone")
    .eq("id", user.id)
    .single();
  const tz = profile?.timezone ?? "Asia/Jakarta";

  const { data: budget } = await supabase
    .from("budgets")
    .select("weekly_limit, share_blowout")
    .eq("user_id", user.id)
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

  const recent = [...(rows ?? [])]
    .sort((a, b) => (a.spent_at < b.spent_at ? 1 : -1))
    .slice(0, 5);

  const today = todayLocal(tz);
  const monthKey = today.slice(0, 7);
  const wkStart = weekStart(today);

  const sum = (xs: { amount: number }[]) =>
    xs.reduce((s, e) => s + e.amount, 0);

  const todayTotal = sum(exps.filter((e) => e.day === today));
  const weekOneOff = sum(
    exps.filter((e) => e.day >= wkStart && !e.is_recurring),
  );

  const monthExps = exps.filter((e) => e.day.startsWith(monthKey));
  const monthTotal = sum(monthExps);
  const recurringTotal = sum(monthExps.filter((e) => e.is_recurring));
  const oneOffTotal = monthTotal - recurringTotal;

  const catTotals = new Map<Category, number>();
  for (const e of monthExps)
    catTotals.set(
      e.category as Category,
      (catTotals.get(e.category as Category) ?? 0) + e.amount,
    );
  const catItems = CATEGORIES.map((c) => ({
    ...c,
    value: catTotals.get(c.id) ?? 0,
  }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const segments = catItems.map((c) => ({ value: c.value, color: c.accent }));
  const maxCat = catItems[0]?.value ?? 0;

  // heatmap: 12 weeks ending the current week
  const dayTotals = new Map<string, number>();
  for (const e of exps)
    dayTotals.set(e.day, (dayTotals.get(e.day) ?? 0) + e.amount);
  const maxDay = Math.max(1, ...Array.from(dayTotals.values()));
  const startMon = addDays(wkStart, -11 * 7);
  const weeks = Array.from({ length: 12 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(startMon, w * 7 + d);
      const amount = dayTotals.get(date) ?? 0;
      const level =
        amount === 0
          ? 0
          : Math.min(4, 1 + Math.floor((amount / maxDay) * 3.999));
      return { date, amount, level, future: date > today };
    }),
  );

  const splitPct = monthTotal > 0 ? (oneOffTotal / monthTotal) * 100 : 0;

  return (
    <main className="flex flex-col gap-5 px-5 pb-4 pt-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-card border border-line bg-surface-2 text-2xl">
            {avatarEmoji(profile?.avatar_id)}
          </span>
          <div>
            <p className="text-sm text-ink-dim">Welcome back</p>
            <h1 className="font-display text-xl font-bold text-ink">
              {profile?.display_name}
            </h1>
          </div>
        </div>
        <Link
          href="/expenses"
          className="rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-ink-dim active:scale-95"
        >
          History →
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Level"
          value={profile?.level ?? 1}
          accent="text-neon-cyan"
        />
        <Stat label="XP" value={profile?.xp ?? 0} accent="text-neon-lime" />
        <Stat
          label="Streak"
          value={`${profile?.current_streak ?? 0}🔥`}
          accent="text-gold"
        />
      </div>

      <section className="surface-card flex items-center justify-between p-5">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          Today
        </span>
        <span className="font-mono text-2xl font-bold text-neon-cyan">
          🪙{formatCoins(todayTotal)}
        </span>
      </section>

      <section className="surface-card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-ink">Recent</h2>
          <Link href="/expenses" className="font-mono text-xs text-neon-cyan">
            all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-2 text-center text-sm text-ink-dim">
            Nothing logged yet.
          </p>
        ) : (
          recent.map((e) => {
            const m = categoryMeta(e.category as Category);
            return (
              <Link
                key={e.id}
                href={`/expenses/${e.id}`}
                className="flex items-center gap-3"
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1 truncate text-sm text-ink">
                  {e.note || m.label}
                </span>
                <span className="font-mono text-sm font-bold text-ink">
                  🪙{formatCoins(e.amount)}
                </span>
              </Link>
            );
          })
        )}
      </section>

      <BudgetCard
        spent={weekOneOff}
        weeklyLimit={budget?.weekly_limit ?? null}
        shareBlowout={budget?.share_blowout ?? false}
      />

      <section className="surface-card flex flex-col gap-4 p-5">
        <h2 className="font-display font-bold text-ink">
          This month by category
        </h2>
        {monthTotal === 0 ? (
          <p className="py-6 text-center text-sm text-ink-dim">
            Nothing logged this month yet.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <Donut segments={segments} total={monthTotal} />
            <BarList items={catItems} max={maxCat} />
          </div>
        )}
      </section>

      <section className="surface-card flex flex-col gap-3 p-5">
        <h2 className="font-display font-bold text-ink">
          Recurring vs one-off
        </h2>
        <div className="flex h-3 overflow-hidden rounded-pill bg-surface-2">
          <div
            className="h-full"
            style={{
              width: `${splitPct}%`,
              background: "var(--color-neon-cyan)",
            }}
          />
          <div
            className="h-full flex-1"
            style={{ background: "var(--color-neon-violet)" }}
          />
        </div>
        <div className="flex justify-between font-mono text-xs">
          <span className="text-neon-cyan">
            one-off 🪙{formatCoins(oneOffTotal)}
          </span>
          <span className="text-neon-violet">
            recurring 🪙{formatCoins(recurringTotal)}
          </span>
        </div>
      </section>

      <section className="surface-card flex flex-col gap-3 p-5">
        <h2 className="font-display font-bold text-ink">Spending heatmap</h2>
        <Heatmap weeks={weeks} />
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-1 py-4">
      <span className={`font-mono text-xl font-bold ${accent}`}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
        {label}
      </span>
    </div>
  );
}
