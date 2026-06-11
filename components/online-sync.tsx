"use client";

import { useEffect, useState } from "react";
import { flushQueue, queueCount } from "@/lib/offline-queue";
import { PixelIcon } from "./ui/pixel-icon";

export function OnlineSync() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const n = await queueCount();
      if (active) setPending(n);
    };
    const run = async () => {
      await flushQueue();
      await refresh();
    };

    run();
    window.addEventListener("online", run);
    window.addEventListener("bounty-queue-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("online", run);
      window.removeEventListener("bounty-queue-changed", refresh);
    };
  }, []);

  if (pending === 0) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-pill bg-neon-violet px-3 py-1 font-mono text-xs text-void shadow-glow-cyan">
      <PixelIcon name="ui/group-temporal" size={12} /> {pending} queued offline
    </div>
  );
}
