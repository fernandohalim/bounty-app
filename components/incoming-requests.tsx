"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarIcon } from "@/lib/avatars";
import { Button } from "./ui/button";
import { Eyebrow } from "./ui/eyebrow";
import { PixelIcon } from "./ui/pixel-icon";

type Req = {
  id: string;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_id: string;
    level: number;
  };
};

export function IncomingRequests({ requests }: { requests: Req[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(id: string, accept: boolean) {
    setBusy(id);
    const supabase = createClient();
    await supabase.rpc("respond_friend_request", {
      p_request: id,
      p_accept: accept,
    });
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-2">
      <Eyebrow tone="pink">Requests · {requests.length}</Eyebrow>
      {requests.map((r) => (
        <div
          key={r.id}
          className="surface-card flex items-center gap-3 px-4 py-3"
        >
          <PixelIcon name={avatarIcon(r.profile.avatar_id)} size={24} />{" "}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">
              {r.profile.display_name}
            </p>
            <p className="font-mono text-xs text-ink-dim">
              @{r.profile.username}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            busy={busy === r.id}
            onClick={() => respond(r.id, true)}
          >
            Accept
          </Button>
          <Button
            variant="danger"
            size="sm"
            busy={busy === r.id}
            onClick={() => respond(r.id, false)}
          >
            ✕
          </Button>
        </div>
      ))}
    </section>
  );
}
