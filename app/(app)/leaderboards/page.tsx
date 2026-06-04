import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/user";
import { LeaderboardBoard } from "@/components/leaderboard-board";

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

  const board = [meP as P, ...friends].sort((a, b) => b.xp - a.xp);

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

      <LeaderboardBoard board={board} me={userId} />

      {board.length === 1 && (
        <p className="text-center text-sm text-ink-dim">
          Add friends to fill the board!
        </p>
      )}
    </main>
  );
}
