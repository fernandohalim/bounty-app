"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { enablePush, isPushEnabled, pushSupported } from "@/lib/push";
import { Toggle } from "./ui/toggle";

type Settings = {
  on_bounty_card: boolean;
  on_reaction: boolean;
  on_friend_request: boolean;
  on_budget_alert: boolean;
  on_group_lock: boolean;
  on_streak_reminder: boolean;
};

const TOGGLES: { key: keyof Settings; label: string; hint: string }[] = [
  {
    key: "on_bounty_card",
    label: "Bounty cards",
    hint: "When friends log in a watched category",
  },
  {
    key: "on_reaction",
    label: "Reactions",
    hint: "When someone reacts to your bounty",
  },
  {
    key: "on_friend_request",
    label: "Friend requests",
    hint: "New incoming requests",
  },
  {
    key: "on_budget_alert",
    label: "Budget blowouts",
    hint: "When a group member busts their budget",
  },
  {
    key: "on_group_lock",
    label: "Group results",
    hint: "When a temporal group locks",
  },
  {
    key: "on_streak_reminder",
    label: "Streak reminders",
    hint: "Nudge before your streak breaks",
  },
];

export function NotificationSettings({ initial }: { initial: Settings }) {
  const [supabase] = useState(() => createClient());
  const [settings, setSettings] = useState<Settings>(initial);
  const [pushOn, setPushOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    isPushEnabled().then(setPushOn);
  }, []);

  async function toggle(key: keyof Settings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user)
      await supabase
        .from("notification_settings")
        .update(next)
        .eq("user_id", user.id);
  }

  async function turnOnPush() {
    setBusy(true);
    setMsg(null);
    const res = await enablePush();
    setBusy(false);
    if (res.ok) {
      setPushOn(true);
      setMsg("Push enabled on this device.");
    } else {
      setMsg(res.error ?? "Couldn't enable push.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="surface-card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-ink">
            Push on this device
          </h2>
          <span
            className={`font-mono text-xs ${pushOn ? "text-neon-lime" : "text-ink-dim"}`}
          >
            {pushOn ? "on ✓" : "off"}
          </span>
        </div>
        {!pushSupported() ? (
          <p className="text-sm text-ink-dim">
            This browser can&apos;t receive push. On iPhone, install Bounty to
            your home screen first, then come back here.
          </p>
        ) : pushOn ? (
          <p className="text-sm text-ink-dim">
            You&apos;ll get notifications here. Toggle categories below.
          </p>
        ) : (
          <button
            onClick={turnOnPush}
            disabled={busy}
            className="rounded-pill bg-neon-cyan py-3 font-display font-bold text-void shadow-glow-cyan active:scale-95 disabled:opacity-50"
          >
            {busy ? "Enabling…" : "Enable push notifications"}
          </button>
        )}
        {msg && <p className="text-center text-sm text-ink-dim">{msg}</p>}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          What to notify
        </h2>
        {TOGGLES.map((t) => (
          <label
            key={t.key}
            className="surface-card flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="min-w-0">
              <span className="block text-sm text-ink">{t.label}</span>
              <span className="block text-xs text-ink-dim">{t.hint}</span>
            </span>
            <Toggle checked={settings[t.key]} onChange={() => toggle(t.key)} />
          </label>
        ))}
      </section>
    </div>
  );
}
