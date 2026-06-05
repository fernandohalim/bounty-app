"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";

type Friend = {
  id: string;
  display_name: string;
  avatar_id: string;
  username: string;
};

export function InviteFriends({
  groupId,
  friends,
}: {
  groupId: string;
  friends: Friend[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function add(fid: string) {
    setBusy(fid);
    const supabase = createClient();
    await supabase.rpc("invite_to_group", {
      p_group: groupId,
      p_friend: fid,
    });
    router.refresh();
  }

  if (friends.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
        Invite friends
      </h2>
      {friends.map((f) => (
        <div
          key={f.id}
          className="surface-card flex items-center gap-3 px-4 py-3"
        >
          <span className="text-2xl">{avatarEmoji(f.avatar_id)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{f.display_name}</p>
            <p className="font-mono text-xs text-ink-dim">@{f.username}</p>
          </div>
          <button
            onClick={() => add(f.id)}
            disabled={busy === f.id}
            className="rounded-pill bg-neon-cyan px-3 py-1.5 text-xs font-bold text-void active:scale-95 disabled:opacity-50"
          >
            {busy === f.id ? "…" : "Invite"}
          </button>
        </div>
      ))}
    </section>
  );
}
