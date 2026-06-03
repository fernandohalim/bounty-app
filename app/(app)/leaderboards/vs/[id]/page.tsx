import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { getUserId } from "@/lib/supabase/user";

function Side({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl">{emoji}</span>
      <span className="max-w-24 truncate text-sm text-ink">{name}</span>
    </div>
  );
}

export default async function VersusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");
  if (id === userId) redirect("/leaderboards");

  const sel =
    "display_name, avatar_id, xp, level, current_streak, longest_streak";
  const { data: meP } = await supabase
    .from("profiles")
    .select(sel)
    .eq("id", userId)
    .single();
  const { data: them } = await supabase
    .from("profiles")
    .select(sel)
    .eq("id", id)
    .maybeSingle();
  if (!meP || !them) redirect("/leaderboards");

  const rows = [
    { label: "Level", me: meP.level, them: them.level },
    { label: "XP", me: meP.xp, them: them.xp },
    {
      label: "Current streak",
      me: meP.current_streak,
      them: them.current_streak,
    },
    { label: "Best streak", me: meP.longest_streak, them: them.longest_streak },
  ];

  return (
    <main className="flex flex-col gap-5 px-5 pb-4 pt-6">
      <Link href="/leaderboards" className="text-ink-dim">
        ← Leaderboard
      </Link>
      <div className="flex items-center justify-around">
        <Side emoji={avatarEmoji(meP.avatar_id)} name="You" />
        <span className="font-display text-2xl font-bold text-neon-pink">
          VS
        </span>
        <Side emoji={avatarEmoji(them.avatar_id)} name={them.display_name} />
      </div>
      <section className="flex flex-col gap-2">
        {rows.map((r) => {
          const meWin = r.me > r.them;
          const themWin = r.them > r.me;
          return (
            <div
              key={r.label}
              className="surface-card flex items-center px-4 py-3"
            >
              <span
                className={`flex-1 text-left font-mono font-bold ${meWin ? "text-neon-lime" : "text-ink"}`}
              >
                {r.me}
                {meWin ? " 👑" : ""}
              </span>
              <span className="flex-1 text-center font-mono text-[10px] uppercase tracking-widest text-ink-dim">
                {r.label}
              </span>
              <span
                className={`flex-1 text-right font-mono font-bold ${themWin ? "text-neon-lime" : "text-ink"}`}
              >
                {themWin ? "👑 " : ""}
                {r.them}
              </span>
            </div>
          );
        })}
      </section>
    </main>
  );
}
