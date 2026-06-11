"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STARTER_AVATARS, avatarIcon } from "@/lib/avatars";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Select } from "@/components/ui/select";
import { PixelIcon } from "@/components/ui/pixel-icon";

const TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Bangkok",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [display, setDisplay] = useState("");
  const [avatar, setAvatar] = useState(STARTER_AVATARS[0]);
  const [timezone, setTimezone] = useState<string>(() =>
    typeof window === "undefined"
      ? "Asia/Jakarta"
      : Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta",
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const usernameOk = /^[a-z0-9_]{3,20}$/.test(username);
  const displayOk = display.trim().length >= 1 && display.trim().length <= 30;
  const canSubmit = usernameOk && displayOk && !submitting;

  const tzOptions = Array.from(new Set([timezone, ...TIMEZONES]));

  async function submit() {
    setErr(null);
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: display.trim(),
      avatar_id: avatar,
      timezone,
    });

    if (error) {
      setErr(
        error.code === "23505" ? "That username is taken." : error.message,
      );
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-ink">
          Set up your player
        </h1>
        <p className="mt-1 text-sm text-ink-dim">
          This is how friends will find you.
        </p>
      </div>

      <div className="surface-card flex flex-col gap-5 p-6">
        {/* avatar */}
        <div>
          <Eyebrow as="label" className="mb-2 block">
            Avatar
          </Eyebrow>
          <div className="flex gap-3">
            {STARTER_AVATARS.map((id) => (
              <button
                key={id}
                onClick={() => setAvatar(id)}
                className={`flex h-16 w-16 items-center justify-center rounded-card border transition ${
                  avatar === id
                    ? "border-neon-cyan bg-surface-2 shadow-glow-cyan"
                    : "border-line bg-surface-2 opacity-60"
                }`}
              >
                <PixelIcon name={avatarIcon(id)} size={48} />{" "}
              </button>
            ))}
          </div>
        </div>

        {/* username */}
        <div>
          <Eyebrow as="label" className="mb-2 block">
            Username · permanent
          </Eyebrow>
          <div className="flex items-center rounded-pill border border-line bg-surface-2 px-4">
            <span className="text-ink-dim">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="coinslayer"
              maxLength={20}
              className="w-full bg-transparent py-2.5 pl-1 text-ink outline-none placeholder:text-ink-dim/50"
            />
          </div>
          {username.length > 0 && !usernameOk && (
            <p className="mt-1 text-xs text-over">
              3–20 chars · lowercase letters, numbers, _
            </p>
          )}
        </div>

        {/* display name */}
        <div>
          <Eyebrow as="label" className="mb-2 block">
            Display name · changeable
          </Eyebrow>
          <TextInput
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
            placeholder="Coin Slayer"
            maxLength={30}
          />
        </div>

        {/* timezone */}
        <div>
          <Eyebrow as="label" className="mb-2 block">
            Timezone · for streaks
          </Eyebrow>
          <Select
            value={timezone}
            options={tzOptions.map((tz) => ({ id: tz, label: tz }))}
            onChange={setTimezone}
            tone="surface2"
            size="md"
            fullWidth
          />
        </div>
      </div>

      {err && <p className="text-center text-sm text-over">{err}</p>}

      <Button
        variant="primary"
        busy={submitting}
        disabled={!canSubmit}
        fullWidth
        onClick={submit}
      >
        {submitting ? "Creating…" : "Enter the arcade →"}
      </Button>
    </main>
  );
}
