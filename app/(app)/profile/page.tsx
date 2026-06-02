import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { levelInfo } from "@/lib/xp";
import { SignOutButton } from "@/components/sign-out-button";
import { AvatarPicker } from "@/components/avatar-picker";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="surface-card flex flex-col items-center gap-1 py-4">
      <span className="font-mono text-xl font-bold text-ink">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
        {label}
      </span>
    </div>
  );
}

export default async function Profile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: p } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_id, level, xp, current_streak, longest_streak, created_at",
    )
    .eq("id", user.id)
    .single();

  const { data: avatars } = await supabase
    .from("avatars")
    .select("id, display_name, unlock_level")
    .order("unlock_level");

  const { count: friends } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  const lvl = levelInfo(p?.xp ?? 0);

  return (
    <main className="flex flex-col gap-6 px-5 pb-4 pt-10">
      <div className="surface-card flex flex-col items-center gap-3 px-6 py-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-card border border-neon-cyan/40 bg-surface-2 text-5xl shadow-glow-cyan">
          {avatarEmoji(p?.avatar_id)}
        </span>
        <AvatarPicker
          avatars={avatars ?? []}
          current={p?.avatar_id ?? "rookie_fox"}
          level={p?.level ?? 1}
        />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {p?.display_name}
          </h1>
          <p className="font-mono text-sm text-ink-dim">@{p?.username}</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1 flex justify-between font-mono text-xs">
            <span className="text-neon-lime">LVL {lvl.level}</span>
            <span className="text-ink-dim">
              {p?.xp ?? 0} / {lvl.nextFloor} XP
            </span>
          </div>
          <div className="h-2.5 rounded-pill bg-surface-2">
            <div
              className="h-full rounded-pill bg-neon-lime"
              style={{ width: `${lvl.pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Streak" value={`${p?.current_streak ?? 0}🔥`} />
        <Stat label="Best" value={p?.longest_streak ?? 0} />
        <Stat label="Friends" value={friends ?? 0} />
      </div>

      <Link
        href="/friends"
        className="rounded-pill border border-line bg-surface-2 py-3 text-center font-semibold text-ink active:scale-95"
      >
        Friends &amp; requests →
      </Link>

      <p className="text-center font-mono text-xs text-ink-dim">
        joined{" "}
        {p?.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
      </p>

      <SignOutButton />
    </main>
  );
}
