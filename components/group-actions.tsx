"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

export function GroupActions({
  groupId,
  isOwner,
}: {
  groupId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function leave() {
    setBusy(true);
    const supabase = createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (!userId) return router.replace("/login");
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    router.push("/groups");
    router.refresh();
  }

  async function del() {
    setBusy(true);
    const supabase = createClient();
    await supabase.from("groups").delete().eq("id", groupId);
    router.push("/groups");
    router.refresh();
  }

  if (isOwner) {
    return (
      <div className="flex flex-col gap-2">
        {!confirming ? (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Delete group
          </Button>
        ) : (
          <div className="surface-card flex flex-col gap-3 p-4">
            <p className="text-xs font-mono text-ink-dim">
              delete this group for everyone? this can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                busy={busy}
                className="flex-1"
                onClick={del}
              >
                yes, delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setConfirming(false)}
              >
                cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button variant="danger" fullWidth busy={busy} onClick={leave}>
      Leave group
    </Button>
  );
}
