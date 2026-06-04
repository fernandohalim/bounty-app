"use client";

import { useState } from "react";

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 font-mono text-neon-cyan"
    >
      {code} <span className="text-ink-dim">{copied ? "✓" : "⧉"}</span>
    </button>
  );
}
