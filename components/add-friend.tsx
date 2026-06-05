"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TextInput } from "./ui/text-input";
import { Button } from "./ui/button";

function friendly(m: string) {
  if (m.includes("no user"))
    return "No user found with that username or email.";
  if (m.includes("already friends")) return "You're already friends!";
  if (m.includes("pending")) return "There's already a pending request.";
  if (m.includes("yourself")) return "You can't add yourself 😅";
  return m;
}

export function AddFriend({ myUsername }: { myUsername: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function add() {
    if (!value.trim()) return;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("send_friend_request", {
      p_identifier: value.trim(),
    });
    if (error) {
      setMsg({ ok: false, text: friendly(error.message) });
      setBusy(false);
      return;
    }
    setMsg({ ok: true, text: "Request sent! 🎯" });
    setValue("");
    setBusy(false);
    router.refresh();
  }

  function copy() {
    navigator.clipboard.writeText("@" + myUsername).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section className="surface-card flex flex-col gap-3 p-5">
      <div className="flex gap-2">
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="username or email"
          className="flex-1"
        />
        <Button
          variant="accent"
          size="sm"
          disabled={busy || !value.trim()}
          onClick={add}
        >
          Add
        </Button>
      </div>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-neon-lime" : "text-over"}`}>
          {msg.text}
        </p>
      )}
      <button
        onClick={copy}
        className="text-left font-mono text-xs text-ink-dim"
      >
        your handle: <span className="text-neon-cyan">@{myUsername}</span> ·{" "}
        {copied ? "copied!" : "tap to copy"}
      </button>
    </section>
  );
}
