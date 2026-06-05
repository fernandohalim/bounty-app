"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";

type Invite = {
  id: string;
  group_name: string;
  inviter: { display_name: string; avatar_id: string; username: string } | null;
};

export function GroupInvites({ invites }: { invites: Invite[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(id: string, accept: boolean) {
    setBusy(id);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("respond_group_invite", {
      p_invite: id,
      p_accept: accept,
    });
    if (error) {
      setBusy(null);
      return;
    }
    if (accept && data) {
      router.push(`/groups/${data}`);
    }
    router.refresh();
  }

  if (invites.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-widest text-neon-pink">
        Group invites · {invites.length}
      </h2>
      {invites.map((inv) => (
        <div
          key={inv.id}
          className="surface-card flex items-center gap-3 px-4 py-3"
        >
          <span className="text-2xl">
            {avatarEmoji(inv.inviter?.avatar_id)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{inv.group_name}</p>
            <p className="font-mono text-xs text-ink-dim">
              from {inv.inviter?.display_name ?? "someone"}
            </p>
          </div>
          <button
            onClick={() => respond(inv.id, true)}
            disabled={busy === inv.id}
            className="rounded-pill bg-neon-lime px-3 py-1.5 text-xs font-bold text-void active:scale-95 disabled:opacity-50"
          >
            Join
          </button>
          <button
            onClick={() => respond(inv.id, false)}
            disabled={busy === inv.id}
            className="rounded-pill border border-over/40 px-3 py-1.5 text-xs text-over active:scale-95 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ))}
    </section>
  );
}
