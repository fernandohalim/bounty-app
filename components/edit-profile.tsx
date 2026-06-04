"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";

type Avatar = { id: string; display_name: string; unlock_level: number };

export function EditProfile({
  avatars,
  currentAvatar,
  currentName,
  level,
}: {
  avatars: Avatar[];
  currentAvatar: string;
  currentName: string;
  level: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nameOk = name.trim().length >= 1 && name.trim().length <= 30;
  const dirty = name.trim() !== currentName || avatar !== currentAvatar;

  async function save() {
    if (!nameOk || !dirty) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.replace("/login");
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim(), avatar_id: avatar })
      .eq("id", user.id);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  function cancel() {
    setName(currentName);
    setAvatar(currentAvatar);
    setErr(null);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-xs text-neon-cyan"
      >
        ✏️ edit profile
      </button>

      {open && (
        <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-void/70 backdrop-blur-sm"
            onClick={cancel}
          />
          <div className="animate-pop-in relative z-10 flex w-full max-w-md flex-col gap-4 rounded-t-card border border-line bg-surface p-5 sm:rounded-card">
            <h2 className="font-display text-lg font-bold text-ink">
              Edit profile
            </h2>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-dim">
                Display name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                className="w-full rounded-pill border border-line bg-surface-2 px-4 py-2.5 text-ink outline-none placeholder:text-ink-dim/50"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-dim">
                Avatar
              </label>
              <div className="grid grid-cols-4 gap-3">
                {avatars.map((a) => {
                  const locked = a.unlock_level > level;
                  const on = avatar === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => !locked && setAvatar(a.id)}
                      disabled={locked}
                      title={a.display_name}
                      className={`relative flex h-14 w-14 items-center justify-center rounded-card border text-2xl ${
                        on ? "border-neon-cyan shadow-glow-cyan" : "border-line"
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
            </div>

            {err && <p className="text-center text-sm text-over">{err}</p>}

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={busy || !nameOk || !dirty}
                className="flex-1 rounded-pill bg-neon-lime py-3 font-display font-bold text-void shadow-glow-lime active:scale-95 disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={cancel}
                className="rounded-pill border border-line px-5 py-3 text-ink active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
