"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarIcon } from "@/lib/avatars";
import { Button } from "./ui/button";
import { Eyebrow } from "./ui/eyebrow";
import { PixelIcon } from "./ui/pixel-icon";

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
      <Eyebrow tone="pink">Group invites · {invites.length}</Eyebrow>
      {invites.map((inv) => (
        <div
          key={inv.id}
          className="surface-card flex items-center gap-3 px-4 py-3"
        >
          <PixelIcon name={avatarIcon(inv.inviter?.avatar_id)} size={24} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{inv.group_name}</p>
            <p className="font-mono text-xs text-ink-dim">
              from {inv.inviter?.display_name ?? "someone"}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            busy={busy === inv.id}
            onClick={() => respond(inv.id, true)}
          >
            join
          </Button>
          <Button
            variant="danger"
            size="sm"
            busy={busy === inv.id}
            onClick={() => respond(inv.id, false)}
          >
            ✕
          </Button>
        </div>
      ))}
    </section>
  );
}
