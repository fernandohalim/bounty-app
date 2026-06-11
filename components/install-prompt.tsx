"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "./ui/pixel-icon";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!evt || dismissed) return null;

  return (
    <div className="mx-5 mt-3 flex items-center gap-3 rounded-pill border border-neon-cyan/40 bg-surface px-4 py-2">
      <PixelIcon name="ui/install" size={20} />
      <span className="flex-1 text-xs text-ink-dim">
        Install Bounty for the full app feel
      </span>
      <button
        onClick={async () => {
          await evt.prompt();
          await evt.userChoice;
          setEvt(null);
        }}
        className="rounded-pill bg-neon-cyan px-3 py-1 text-xs font-bold text-void active:scale-95"
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="text-ink-dim">
        ✕
      </button>
    </div>
  );
}
