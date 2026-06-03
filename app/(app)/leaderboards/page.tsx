import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { getUserId } from "@/lib/supabase/user";

function medal(i: number) {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
}

export default async function LeaderboardsPage() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: meP } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_id, xp, level, current_streak")
    .eq("id", userId)
    .single();
  if (!meP) redirect("/login");

  const { data: fr } = await supabase
    .from("friendships")
    .select(
      `requester_id, addressee_id,
       requester:profiles!friendships_requester_id_fkey(id, display_name, avatar_id, xp, level, current_streak),
       addressee:profiles!friendships_addressee_id_fkey(id, display_name, avatar_id, xp, level, current_streak)`,
    )
    .eq("status", "accepted");

  type P = {
    id: string;
    display_name: string;
    avatar_id: string;
    xp: number;
    level: number;
    current_streak: number;
  };
  type FrRow = {
    requester_id: string;
    addressee_id: string;
    requester: P;
    addressee: P;
  };
  const friends = ((fr ?? []) as unknown as FrRow[]).map((r) =>
    r.requester_id === userId ? r.addressee : r.requester,
  );

  const board = [meP, ...friends].sort((a, b) => b.xp - a.xp);

  return (
    <main className="flex flex-col gap-4 px-5 pb-4 pt-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Leaderboard
        </h1>
        <p className="font-mono text-xs text-ink-dim">
          Global XP · you + friends
        </p>
      </div>
      <section className="flex flex-col gap-2">
        {board.map((p, i) => {
          const isMe = p.id === userId;
          const inner = (
            <div
              className={`surface-card flex items-center gap-3 px-4 py-3 ${isMe ? "border-neon-cyan" : ""}`}
            >
              <span className="w-6 text-center font-mono text-sm font-bold text-ink-dim">
                {medal(i)}
              </span>
              <span className="text-2xl">{avatarEmoji(p.avatar_id)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  {p.display_name}
                  {isMe ? " (you)" : ""}
                </p>
                <p className="font-mono text-[11px] text-ink-dim">
                  LVL {p.level} · {p.current_streak}🔥
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-neon-lime">
                {p.xp} XP
              </span>
            </div>
          );
          return isMe ? (
            <div key={p.id}>{inner}</div>
          ) : (
            <Link key={p.id} href={`/leaderboards/vs/${p.id}`}>
              {inner}
            </Link>
          );
        })}
      </section>
      {board.length === 1 && (
        <p className="text-center text-sm text-ink-dim">
          Add friends to fill the board!
        </p>
      )}
    </main>
  );
}
