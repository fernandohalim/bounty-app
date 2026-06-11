"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PixelIcon } from "./ui/pixel-icon";

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setLoading(false);
  }

  return (
    <button
      onClick={signIn}
      disabled={loading}
      className="animate-pulse-glow flex items-center gap-3 rounded-pill border border-neon-cyan/50 bg-surface px-7 py-3.5 font-semibold text-ink transition active:scale-95 disabled:opacity-60"
    >
      {loading ? (
        <PixelIcon name="ui/group-temporal" size={20} />
      ) : (
        <PixelIcon name="ui/controller" size={20} />
      )}
      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}
