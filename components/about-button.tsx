"use client";

import { useState } from "react";
import { AboutModal } from "@/components/about-modal";
import { NavRow } from "./ui/nav-row";
import { PixelIcon } from "./ui/pixel-icon";

export function AboutButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <NavRow onClick={() => setOpen(true)}>
        <span className="inline-flex items-center justify-center gap-2">
          <PixelIcon name="ui/info" size={18} /> About Bounty
        </span>
      </NavRow>
      <AboutModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
