import Link from "next/link";
import { avatarIcon } from "@/lib/avatars";
import { Eyebrow } from "./ui/eyebrow";
import { PixelIcon } from "./ui/pixel-icon";
import { Coins } from "./ui/coins";

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
  icon: string;
}[] = [
  { key: "whale", label: "The Whale", icon: "badges/whale" },
  { key: "sniper", label: "The Sniper", icon: "badges/sniper" },
  { key: "sticky_fingers", label: "Sticky Fingers", icon: "badges/sticky" },
  { key: "monk", label: "The Monk", icon: "badges/monk" },
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
          <h1 className="font-display text-2xl font-bold text-ink">
            {groupName}
          </h1>
          <p className="font-mono text-[11px] text-gold">
            <p className="flex items-center gap-1 font-mono text-[11px] text-gold">
              <PixelIcon name="ui/group-locked" size={11} /> Locked · final
              results
            </p>{" "}
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
              <PixelIcon name={t.icon} size={36} />{" "}
              <span className="font-display text-sm font-bold text-gold">
                {t.label}
              </span>
              {winner ? (
                <span className="flex items-center gap-1 text-xs text-ink">
                  <PixelIcon name={avatarIcon(winner.avatar_id)} size={16} />
                  {winner.display_name}
                </span>
              ) : (
                <span className="text-xs text-ink-dim">—</span>
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <Eyebrow>Final standings</Eyebrow>
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
            <PixelIcon name={avatarIcon(r.avatar_id)} size={24} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{r.display_name}</p>
              <p className="font-mono text-[11px] text-ink-dim">
                <p className="flex items-center gap-1 font-mono text-[11px] text-ink-dim">
                  {r.txns} txns · max <Coins amount={r.biggest} size={12} />
                </p>
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-ink">
              <Coins amount={r.total} size={14} />
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
