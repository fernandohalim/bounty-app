import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarIcon } from "@/lib/avatars";
import { levelInfo } from "@/lib/xp";
import { SignOutButton } from "@/components/sign-out-button";
import { EditProfile } from "@/components/edit-profile";
import { getUserId } from "@/lib/supabase/user";
import { AboutButton } from "@/components/about-button";
import { Stat } from "@/components/ui/stat";
import { Eyebrow } from "@/components/ui/eyebrow";
import { NavRow } from "@/components/ui/nav-row";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { badgeIconForEmoji } from "@/lib/badges";

export default async function Profile() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: p } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_id, level, xp, current_streak, longest_streak, created_at",
    )
    .eq("id", userId)
    .single();

  const { data: avatars } = await supabase
    .from("avatars")
    .select("id, display_name, unlock_level")
    .order("unlock_level");

  const { count: friends } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  const { data: trophies } = await supabase
    .from("trophies")
    .select("id, title, emoji, group_name, awarded_at")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });

  const lvl = levelInfo(p?.xp ?? 0);

  return (
    <main className="flex flex-col gap-6 px-5 pb-4 pt-10">
      <div className="surface-card flex flex-col items-center gap-3 px-6 py-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-card border border-neon-cyan/40 bg-surface-2 shadow-glow-cyan">
          <PixelIcon name={avatarIcon(p?.avatar_id)} size={64} />{" "}
        </span>
        <EditProfile
          avatars={avatars ?? []}
          currentAvatar={p?.avatar_id ?? "rookie_fox"}
          currentName={p?.display_name ?? ""}
          level={p?.level ?? 1}
        />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
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
        <Stat
          label="Streak"
          value={
            <span className="inline-flex items-center gap-1">
              {p?.current_streak ?? 0}
              <PixelIcon name="reactions/fire" size={18} />
            </span>
          }
        />
        <Stat label="Best" value={p?.longest_streak ?? 0} />
        <Stat label="Friends" value={friends ?? 0} />
      </div>

      <NavRow href="/friends">Friends &amp; requests →</NavRow>

      <p className="text-center font-mono text-xs text-ink-dim">
        joined{" "}
        {p?.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
      </p>
      <section className="flex flex-col gap-2">
        <Eyebrow tone="gold">
          <span className="inline-flex items-center gap-1">
            <PixelIcon name="ui/trophy" size={14} /> Trophy room ·{" "}
            {trophies?.length ?? 0}
          </span>
        </Eyebrow>
        {!trophies || trophies.length === 0 ? (
          <div className="surface-card px-6 py-6 text-center text-sm text-ink-dim">
            No trophies yet. Win a temporal group to earn titles!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {trophies.map((t) => (
              <div
                key={t.id}
                className="surface-card flex flex-col items-center gap-1 p-4 text-center"
              >
                {badgeIconForEmoji(t.emoji) ? (
                  <PixelIcon name={badgeIconForEmoji(t.emoji)!} size={36} />
                ) : (
                  <span className="text-3xl">{t.emoji}</span>
                )}{" "}
                <span className="font-display text-sm font-bold text-gold">
                  {t.title}
                </span>
                <span className="font-mono text-[10px] text-ink-dim">
                  {t.group_name}
                </span>
                <span className="font-mono text-[10px] text-ink-dim">
                  {new Date(t.awarded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      <NavRow href="/settings">
        <span className="inline-flex items-center justify-center gap-2">
          <PixelIcon name="ui/settings" size={18} /> Notification settings
        </span>
      </NavRow>
      <AboutButton />
      <SignOutButton />
    </main>
  );
}
