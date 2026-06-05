"use client";

import { useState } from "react";
import { AboutModal } from "@/components/about-modal";
import { NavRow } from "./ui/nav-row";

export function AboutButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <NavRow onClick={() => setOpen(true)}>ℹ️ About Bounty</NavRow>
      <AboutModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
