"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinGroup() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function join() {
    if (!code.trim()) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_group_with_code", {
      p_code: code.trim().toUpperCase(),
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
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="INVITE CODE"
          className="flex-1 rounded-pill border border-line bg-surface-2 px-4 py-2.5 font-mono uppercase tracking-widest text-ink outline-none placeholder:text-ink-dim/40"
        />
        <button
          onClick={join}
          disabled={busy || !code.trim()}
          className="rounded-pill border border-neon-lime/50 px-4 py-2.5 font-semibold text-neon-lime active:scale-95 disabled:opacity-40"
        >
          Join
        </button>
      </div>
      {err && <p className="text-sm text-over">{err}</p>}
    </div>
  );
}
