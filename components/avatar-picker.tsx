"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";

type Avatar = { id: string; display_name: string; unlock_level: number };

export function AvatarPicker({
  avatars,
  current,
  level,
}: {
  avatars: Avatar[];
  current: string;
  level: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(current);
  const [busy, setBusy] = useState(false);

  async function pick(id: string, locked: boolean) {
    if (locked || busy) return;
    setSel(id);
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.replace("/login");
    await supabase.from("profiles").update({ avatar_id: id }).eq("id", user.id);
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-xs text-neon-cyan"
      >
        {open ? "close" : "change avatar"}
      </button>
      {open && (
        <div className="grid grid-cols-4 gap-3">
          {avatars.map((a) => {
            const locked = a.unlock_level > level;
            return (
              <button
                key={a.id}
                onClick={() => pick(a.id, locked)}
                disabled={busy || locked}
                title={a.display_name}
                className={`relative flex h-14 w-14 items-center justify-center rounded-card border text-2xl ${
                  sel === a.id
                    ? "border-neon-cyan shadow-glow-cyan"
                    : "border-line"
                } ${locked ? "opacity-40" : ""}`}
              >
                {avatarEmoji(a.id)}
                {locked && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-surface-2 px-1 text-[9px] text-ink-dim">
                    L{a.unlock_level}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
