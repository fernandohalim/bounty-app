"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { TextInput } from "./ui/text-input";

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
        <TextInput
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="invite code"
          mono
          size="sm"
          className="flex-1 tracking-widest"
        />
        <Button
          variant="primary"
          size="sm"
          busy={busy}
          disabled={!code.trim()}
          onClick={join}
        >
          join
        </Button>
      </div>
      {err && <p className="text-sm text-over">{err}</p>}
    </div>
  );
}
