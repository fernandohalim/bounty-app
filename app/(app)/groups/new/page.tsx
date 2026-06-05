"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category } from "@/lib/categories";
import { Toggle } from "@/components/ui/toggle";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";

const DURATIONS = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
];

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"permanent" | "temporal">("permanent");
  const [days, setDays] = useState(7);
  const [cats, setCats] = useState<Category[]>([]);
  const [maxUses, setMaxUses] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shareBlowout, setShareBlowout] = useState(false);

  const canCreate = name.trim().length > 0 && cats.length > 0 && !busy;

  function toggleCat(c: Category) {
    setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  }

  async function create() {
    if (!canCreate) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const expires =
      kind === "temporal"
        ? new Date(Date.now() + days * 86400000).toISOString()
        : null;
    const { data, error } = await supabase.rpc("create_group", {
      p_name: name.trim(),
      p_kind: kind,
      p_expires_at: expires,
      p_categories: cats,
      p_invite_max_uses: maxUses ? parseInt(maxUses, 10) : null,
      p_invite_expires_at: null,
      p_share_blowout: shareBlowout,
    });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    router.push(`/groups/${data}`);
    router.refresh();
  }

  return (
    <main className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <h1 className="font-display text-3xl font-bold text-ink">New group</h1>

      <TextInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="group name"
        maxLength={40}
        tone="surface"
      />

      <SegmentedToggle
        value={kind}
        onChange={setKind}
        options={[
          { id: "permanent", label: "permanent" },
          { id: "temporal", label: "temporal" },
        ]}
        fullWidth
      />

      {kind === "temporal" && (
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.days}
              onClick={() => setDays(d.days)}
              className={`flex-1 rounded-pill py-2 text-xs border font-mono font-bold lowercase transition ${
                days === d.days
                  ? "border-neon-violet bg-surface-2 text-ink"
                  : "border-line text-ink-dim"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-ink-dim">
          Listen to categories
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const on = cats.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                style={on ? { borderColor: c.accent } : {}}
                className={`flex items-center gap-1.5 rounded-pill border px-3 py-2 text-sm ${
                  on
                    ? "bg-surface-2 text-ink"
                    : "border-line bg-surface text-ink-dim"
                }`}
              >
                <span>{c.emoji}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-pill border border-line bg-surface px-5 py-3 text-sm text-ink-dim">
        <span className="flex flex-col">
          <span className="text-ink">Share budget blowouts</span>
          <span className="text-xs">
            Members&apos; blowouts &amp; budget changes post here
          </span>
        </span>
        <Toggle checked={shareBlowout} onChange={setShareBlowout} />
      </label>

      <label className="flex items-center justify-between font-mono text-xs rounded-pill border border-line bg-surface px-4 py-2 text-ink-dim">
        invite max uses (optional)
        <input
          inputMode="numeric"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ""))}
          placeholder="∞"
          className="w-20 bg-transparent text-right font-mono text-ink outline-none"
        />
      </label>

      {err && <p className="text-center text-sm text-over">{err}</p>}

      <Button
        variant="primary"
        busy={busy}
        disabled={!canCreate}
        fullWidth
        onClick={create}
      >
        {busy ? "Creating…" : "Create group →"}
      </Button>
    </main>
  );
}
