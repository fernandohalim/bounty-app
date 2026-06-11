"use client";

import { useState } from "react";
import { avatarIcon } from "@/lib/avatars";
import { ProfileView } from "@/components/profile-view";
import { PixelIcon } from "./ui/pixel-icon";

type P = {
  id: string;
  display_name: string;
  avatar_id: string;
  xp: number;
  level: number;
  current_streak: number;
};

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
            <span className="flex w-6 justify-center font-mono text-sm font-bold text-ink-dim">
              {i < 3 ? (
                <PixelIcon
                  name={
                    ["ui/medal-gold", "ui/medal-silver", "ui/medal-bronze"][i]
                  }
                  size={18}
                />
              ) : (
                i + 1
              )}
            </span>
            <PixelIcon name={avatarIcon(p.avatar_id)} size={24} />{" "}
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm text-ink">
                {p.display_name}
                {isMe ? " (you)" : ""}
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px] text-ink-dim">
                <span>
                  LVL {p.level} · {p.current_streak}
                </span>
                <PixelIcon name="reactions/fire" size={12} />
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
