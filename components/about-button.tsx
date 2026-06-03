"use client";

import { useState } from "react";
import { AboutModal } from "@/components/about-modal";

export function AboutButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-pill border border-line bg-surface-2 py-3 text-center font-semibold text-ink active:scale-95"
      >
        ℹ️ About Bounty
      </button>
      <AboutModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
