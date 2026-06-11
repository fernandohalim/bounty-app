"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarIcon } from "@/lib/avatars";
import { Button } from "./ui/button";
import { Eyebrow } from "./ui/eyebrow";
import { PixelIcon } from "./ui/pixel-icon";

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
      <Eyebrow>Members · {members.length}</Eyebrow>
      {members.map((m) => (
        <div
          key={m.user_id}
          className="surface-card flex flex-col gap-2 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <PixelIcon name={avatarIcon(m.avatar_id)} size={24} />{" "}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink"> {m.display_name}</p>
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
              <Button
                variant="gold"
                size="sm"
                busy={busy}
                className="flex-1"
                onClick={() => transfer(m.user_id)}
              >
                <PixelIcon name="reactions/crown" size={14} /> make owner{" "}
              </Button>
              <Button
                variant="danger"
                size="sm"
                busy={busy}
                className="flex-1"
                onClick={() => kick(m.user_id)}
              >
                remove
              </Button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
