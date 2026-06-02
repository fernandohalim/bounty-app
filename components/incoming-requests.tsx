"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";

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
      <h2 className="font-mono text-xs uppercase tracking-widest text-neon-pink">
        Requests · {requests.length}
      </h2>
      {requests.map((r) => (
        <div
          key={r.id}
          className="surface-card flex items-center gap-3 px-4 py-3"
        >
          <span className="text-2xl">{avatarEmoji(r.profile.avatar_id)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">
              {r.profile.display_name}
            </p>
            <p className="font-mono text-xs text-ink-dim">
              @{r.profile.username}
            </p>
          </div>
          <button
            onClick={() => respond(r.id, true)}
            disabled={busy === r.id}
            className="rounded-pill bg-neon-lime px-3 py-1.5 text-xs font-bold text-void active:scale-95 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => respond(r.id, false)}
            disabled={busy === r.id}
            className="rounded-pill border border-over/40 px-3 py-1.5 text-xs text-over active:scale-95 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ))}
    </section>
  );
}
