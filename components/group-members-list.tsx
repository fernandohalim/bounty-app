"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";

type Member = {
  user_id: string;
  role: string;
  display_name: string;
  avatar_id: string;
  username: string;
  level: number;
};

export function GroupMembersList({
  groupId,
  members,
  isOwner,
}: {
  groupId: string;
  members: Member[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function transfer(userId: string) {
    setBusy(true);
    const supabase = createClient();
    await supabase.rpc("transfer_ownership", {
      p_group: groupId,
      p_new_owner: userId,
    });
    setBusy(false);
    setOpenFor(null);
    router.refresh();
  }

  async function kick(userId: string) {
    setBusy(true);
    const supabase = createClient();
    await supabase.rpc("kick_member", { p_group: groupId, p_user: userId });
    setBusy(false);
    setOpenFor(null);
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
        Members · {members.length}
      </h2>
      {members.map((m) => (
        <div
          key={m.user_id}
          className="surface-card flex flex-col gap-2 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{avatarEmoji(m.avatar_id)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-md text-ink">
                {m.display_name}
              </p>
              <p className="font-mono text-xs text-ink-dim">@{m.username}</p>
            </div>
            {m.role === "owner" && (
              <span className="rounded-pill bg-gold/15 px-2 py-0.5 font-mono text-[10px] text-gold">
                owner
              </span>
            )}
            <span className="rounded-pill bg-neon-cyan/10 px-2 py-0.5 font-mono text-xs text-neon-cyan">
              LVL {m.level}
            </span>
            {isOwner && m.role !== "owner" && (
              <button
                onClick={() =>
                  setOpenFor((o) => (o === m.user_id ? null : m.user_id))
                }
                aria-label="Manage member"
                className="px-1 text-ink-dim active:scale-90"
              >
                ⋯
              </button>
            )}
          </div>

          {isOwner && openFor === m.user_id && (
            <div className="flex gap-2 border-t border-line pt-2">
              <button
                onClick={() => transfer(m.user_id)}
                disabled={busy}
                className="flex-1 rounded-pill border border-gold/40 bg-gold/10 py-2 text-xs font-mono text-gold active:scale-95 disabled:opacity-50"
              >
                👑 make owner
              </button>
              <button
                onClick={() => kick(m.user_id)}
                disabled={busy}
                className="flex-1 rounded-pill border border-over/40 bg-over/10 py-2 text-xs font-mono text-over active:scale-95 disabled:opacity-50"
              >
                remove
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
