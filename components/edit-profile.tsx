"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";
import { Modal } from "./ui/modal";
import { TextInput } from "./ui/text-input";
import { Button } from "./ui/button";
import { Eyebrow } from "./ui/eyebrow";

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
          <Modal onClose={cancel} className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-ink">
              Edit profile
            </h2>

            <div>
              <Eyebrow as="label" className="mb-2 block">
                Display name
              </Eyebrow>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div>
              <Eyebrow as="label" className="mb-2 block">
                Avatar
              </Eyebrow>
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
              <Button
                variant="primary"
                busy={busy}
                disabled={!nameOk || !dirty}
                className="flex-1"
                onClick={save}
              >
                {busy ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="ghost" onClick={cancel}>
                Cancel
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
}
