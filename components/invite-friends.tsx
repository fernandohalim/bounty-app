"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarIcon } from "@/lib/avatars";
import { Button } from "./ui/button";
import { Eyebrow } from "./ui/eyebrow";
import { PixelIcon } from "./ui/pixel-icon";

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
      <Eyebrow>Invite friends</Eyebrow>
      {friends.map((f) => (
        <div
          key={f.id}
          className="surface-card flex items-center gap-3 px-4 py-3"
        >
          <PixelIcon name={avatarIcon(f.avatar_id)} size={24} />{" "}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{f.display_name}</p>
            <p className="font-mono text-xs text-ink-dim">@{f.username}</p>
          </div>
          <Button
            variant="accent"
            size="sm"
            busy={busy === f.id}
            onClick={() => add(f.id)}
          >
            {busy === f.id ? "…" : "Invite"}
          </Button>
        </div>
      ))}
    </section>
  );
}
