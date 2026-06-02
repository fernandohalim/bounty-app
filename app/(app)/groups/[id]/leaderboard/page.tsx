import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { formatCoins } from "@/lib/format";

export default async function GroupLeaderboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("name, status")
    .eq("id", id)
    .maybeSingle();
  if (!group) redirect("/groups");

  const { data: rows } = await supabase.rpc("group_leaderboard", {
    p_group: id,
  });
  const board = rows ?? [];

  const top = (key: "total" | "biggest" | "txns") =>
    board.filter((r) => r[key] > 0).sort((a, b) => b[key] - a[key])[0]?.user_id;
  const whale = top("total");
  const sniper = top("biggest");
  const sticky = top("txns");
  const monk = board.slice().sort((a, b) => a.total - b.total)[0]?.user_id;

  const titles = (uid: string) =>
    [
      uid === whale && "🐋",
      uid === sniper && "🎯",
      uid === sticky && "🫳",
      uid === monk && "🧘",
    ]
      .filter(Boolean)
      .join(" ");

  const ranked = board.slice().sort((a, b) => b.total - a.total);

  return (
    <main className="flex flex-col gap-5 px-5 pb-4 pt-6">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${id}`} className="text-xl text-ink-dim">
          ←
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            {group.name}
          </h1>
          <p className="font-mono text-[11px] text-ink-dim">
            {group.status === "locked"
              ? "Final standings 🏁"
              : "Live standings"}
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        {ranked.length === 0 && (
          <div className="surface-card px-6 py-8 text-center text-sm text-ink-dim">
            No spending tracked yet.
          </div>
        )}
        {ranked.map((r, i) => (
          <div
            key={r.user_id}
            className={`surface-card flex items-center gap-3 px-4 py-3 ${r.user_id === user.id ? "border-neon-cyan" : ""}`}
          >
            <span className="w-5 text-center font-mono text-sm font-bold text-ink-dim">
              {i + 1}
            </span>
            <span className="text-2xl">{avatarEmoji(r.avatar_id)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">
                {r.display_name} {titles(r.user_id)}
              </p>
              <p className="font-mono text-[11px] text-ink-dim">
                {r.txns} txns · max 🪙{formatCoins(r.biggest)}
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-ink">
              🪙{formatCoins(r.total)}
            </span>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap justify-center gap-3 text-xs text-ink-dim">
        <span>🐋 Whale</span>
        <span>🎯 Sniper</span>
        <span>🫳 Sticky Fingers</span>
        <span>🧘 Monk</span>
      </div>
    </main>
  );
}
