"use client";

import { useState } from "react";
import { avatarEmoji } from "@/lib/avatars";
import { ProfileView } from "@/components/profile-view";

type P = {
  id: string;
  display_name: string;
  avatar_id: string;
  xp: number;
  level: number;
  current_streak: number;
};

function medal(i: number) {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
}

export function LeaderboardBoard({ board, me }: { board: P[]; me: string }) {
  const [viewing, setViewing] = useState<P | null>(null);

  return (
    <section className="flex flex-col gap-2">
      {board.map((p, i) => {
        const isMe = p.id === me;
        const inner = (
          <div
            className={`surface-card flex items-center gap-3 px-4 py-3 ${isMe ? "border-neon-cyan" : ""}`}
          >
            <span className="w-6 text-center font-mono text-sm font-bold text-ink-dim">
              {medal(i)}
            </span>
            <span className="text-2xl">{avatarEmoji(p.avatar_id)}</span>
            <div className="min-w-0 flex-1 text-left">
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
          <button
            key={p.id}
            onClick={() => setViewing(p)}
            className="w-full active:scale-[0.99]"
          >
            {inner}
          </button>
        );
      })}

      {viewing && (
        <ProfileView
          userId={viewing.id}
          initialName={viewing.display_name}
          initialAvatar={viewing.avatar_id}
          onClose={() => setViewing(null)}
        />
      )}
    </section>
  );
}
