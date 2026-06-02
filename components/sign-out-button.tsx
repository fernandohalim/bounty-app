"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="rounded-pill border border-over/40 bg-over/10 px-6 py-3 font-semibold text-over transition active:scale-95"
    >
      Sign out
    </button>
  );
}
