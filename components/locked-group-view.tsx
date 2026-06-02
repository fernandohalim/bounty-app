import Link from "next/link";
import { avatarEmoji } from "@/lib/avatars";
import { formatCoins } from "@/lib/format";

type Rank = {
  user_id: string;
  display_name: string;
  avatar_id: string;
  total: number;
  txns: number;
  biggest: number;
};

export type Final = {
  locked_at: string;
  ranking: Rank[];
  titles: {
    whale: string | null;
    sniper: string | null;
    sticky_fingers: string | null;
    monk: string | null;
  };
};

const TITLE_META: {
  key: keyof Final["titles"];
  label: string;
  emoji: string;
}[] = [
  { key: "whale", label: "The Whale", emoji: "🐋" },
  { key: "sniper", label: "The Sniper", emoji: "🎯" },
  { key: "sticky_fingers", label: "Sticky Fingers", emoji: "🫳" },
  { key: "monk", label: "The Monk", emoji: "🧘" },
];

export function LockedGroupView({
  groupName,
  final,
  me,
}: {
  groupName: string;
  final: Final | null;
  me: string;
}) {
  const ranking = final?.ranking ?? [];
  const byId = new Map(ranking.map((r) => [r.user_id, r]));

  return (
    <main className="flex flex-col gap-6 px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <Link href="/groups" className="text-xl text-ink-dim">
          ←
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            {groupName}
          </h1>
          <p className="font-mono text-[11px] text-gold">
            🏁 Locked · final results
          </p>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        {TITLE_META.map((t) => {
          const uid = final?.titles?.[t.key] ?? null;
          const winner = uid ? byId.get(uid) : null;
          return (
            <div
              key={t.key}
              className="surface-card flex flex-col items-center gap-1 p-4 text-center"
            >
              <span className="text-3xl">{t.emoji}</span>
              <span className="font-display text-sm font-bold text-gold">
                {t.label}
              </span>
              {winner ? (
                <span className="flex items-center gap-1 text-xs text-ink">
                  {avatarEmoji(winner.avatar_id)} {winner.display_name}
                </span>
              ) : (
                <span className="text-xs text-ink-dim">—</span>
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          Final standings
        </h2>
        {ranking.length === 0 && (
          <div className="surface-card px-6 py-8 text-center text-sm text-ink-dim">
            No spending was tracked.
          </div>
        )}
        {ranking.map((r, i) => (
          <div
            key={r.user_id}
            className={`surface-card flex items-center gap-3 px-4 py-3 ${r.user_id === me ? "border-neon-cyan" : ""}`}
          >
            <span className="w-5 text-center font-mono text-sm font-bold text-ink-dim">
              {i + 1}
            </span>
            <span className="text-2xl">{avatarEmoji(r.avatar_id)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{r.display_name}</p>
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
    </main>
  );
}
