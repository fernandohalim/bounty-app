"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";
import { levelInfo } from "@/lib/xp";

type Profile = {
  username: string;
  display_name: string;
  avatar_id: string;
  level: number;
  xp: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
};

type Trophy = {
  id: string;
  title: string;
  emoji: string;
  group_name: string;
  awarded_at: string;
};

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

export function ProfileView({
  userId,
  initialName,
  initialAvatar,
  onClose,
  onUnfriend,
}: {
  userId: string;
  initialName?: string;
  initialAvatar?: string;
  onClose: () => void;
  onUnfriend?: () => Promise<void>;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmUnfriend, setConfirmUnfriend] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "username, display_name, avatar_id, level, xp, current_streak, longest_streak, created_at",
          )
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("trophies")
          .select("id, title, emoji, group_name, awarded_at")
          .eq("user_id", userId)
          .order("awarded_at", { ascending: false }),
      ]);
      if (!active) return;
      setProfile(p as Profile | null);
      setTrophies((t ?? []) as Trophy[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const lvl = levelInfo(profile?.xp ?? 0);
  const name = profile?.display_name ?? initialName ?? "";
  const avatar = profile?.avatar_id ?? initialAvatar;

  async function doUnfriend() {
    if (!onUnfriend) return;
    setBusy(true);
    await onUnfriend();
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-void/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-pop-in relative z-10 flex max-h-[85vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-card border border-line bg-surface p-5 sm:rounded-card">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-card border border-neon-cyan/40 bg-surface-2 text-5xl shadow-glow-cyan">
            {avatarEmoji(avatar)}
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">{name}</h2>
            {profile && (
              <p className="font-mono text-sm text-ink-dim">
                @{profile.username}
              </p>
            )}
          </div>
          {profile && (
            <div className="w-full max-w-xs">
              <div className="mb-1 flex justify-between font-mono text-xs">
                <span className="text-neon-lime">LVL {lvl.level}</span>
                <span className="text-ink-dim">
                  {profile.xp} / {lvl.nextFloor} XP
                </span>
              </div>
              <div className="h-2.5 rounded-pill bg-surface-2">
                <div
                  className="h-full rounded-pill bg-neon-lime"
                  style={{ width: `${lvl.pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {loading && !profile ? (
          <p className="py-4 text-center font-mono text-sm text-ink-dim">
            loading…
          </p>
        ) : !profile ? (
          <p className="py-4 text-center text-sm text-ink-dim">
            Couldn&apos;t load this profile.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Streak" value={`${profile.current_streak}🔥`} />
              <Stat label="Best" value={profile.longest_streak} />
            </div>

            <section className="flex flex-col gap-2">
              <h3 className="font-mono text-xs uppercase tracking-widest text-gold">
                🏆 Trophy room · {trophies.length}
              </h3>
              {trophies.length === 0 ? (
                <div className="surface-card px-6 py-6 text-center text-sm text-ink-dim">
                  No trophies yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {trophies.map((t) => (
                    <div
                      key={t.id}
                      className="surface-card flex flex-col items-center gap-1 p-4 text-center"
                    >
                      <span className="text-3xl">{t.emoji}</span>
                      <span className="font-display text-sm font-bold text-gold">
                        {t.title}
                      </span>
                      <span className="font-mono text-[10px] text-ink-dim">
                        {t.group_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <p className="text-center font-mono text-xs text-ink-dim">
              joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </>
        )}

        {onUnfriend &&
          (confirmUnfriend ? (
            <div className="flex gap-2">
              <button
                onClick={doUnfriend}
                disabled={busy}
                className="flex-1 rounded-pill bg-over py-2.5 font-bold text-void active:scale-95 disabled:opacity-50"
              >
                Yes, unfriend
              </button>
              <button
                onClick={() => setConfirmUnfriend(false)}
                className="flex-1 rounded-pill border border-line py-2.5 text-ink"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmUnfriend(true)}
              className="rounded-pill border border-over/40 bg-over/10 py-3 font-semibold text-over active:scale-95"
            >
              Unfriend
            </button>
          ))}

        <button
          onClick={onClose}
          className="rounded-pill border border-line bg-surface-2 py-3 font-semibold text-ink active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}
