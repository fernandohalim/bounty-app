"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.replace("/login");
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);
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
          <button
            onClick={() => setConfirming(true)}
            className="rounded-pill border border-over/40 bg-over/10 py-3 font-semibold text-over active:scale-95"
          >
            Delete group
          </button>
        ) : (
          <div className="surface-card flex flex-col gap-3 p-4">
            <p className="text-sm text-ink-dim">
              Delete this group for everyone? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={del}
                disabled={busy}
                className="flex-1 rounded-pill bg-over py-2.5 font-bold text-void active:scale-95 disabled:opacity-50"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-pill border border-line py-2.5 text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={leave}
      disabled={busy}
      className="rounded-pill border border-over/40 bg-over/10 py-3 font-semibold text-over active:scale-95 disabled:opacity-50"
    >
      Leave group
    </button>
  );
}
