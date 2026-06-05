"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avatarEmoji } from "@/lib/avatars";
import { ProfileView } from "@/components/profile-view";
import { Eyebrow } from "./ui/eyebrow";

type Prof = {
  id: string;
  username: string;
  display_name: string;
  avatar_id: string;
  level: number;
};

type Friend = { friendshipId: string; profile: Prof };

export function FriendsList({ friends }: { friends: Friend[] }) {
  const router = useRouter();
  const [viewing, setViewing] = useState<Friend | null>(null);

  async function unfriend(friendshipId: string) {
    const supabase = createClient();
    await supabase.from("friendships").delete().eq("id", friendshipId);
    setViewing(null);
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-2">
      <Eyebrow>Friends · {friends.length}</Eyebrow>
      {friends.length === 0 ? (
        <div className="surface-card px-6 py-8 text-center text-sm text-ink-dim">
          No friends yet. Add someone above!
        </div>
      ) : (
        friends.map((f) => (
          <button
            key={f.friendshipId}
            onClick={() => setViewing(f)}
            className="surface-card flex w-full items-center gap-3 px-4 py-3 text-left active:scale-[0.99]"
          >
            <span className="text-2xl">{avatarEmoji(f.profile.avatar_id)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">
                {f.profile.display_name}
              </p>
              <p className="font-mono text-xs text-ink-dim">
                @{f.profile.username}
              </p>
            </div>
            <span className="rounded-pill bg-neon-cyan/10 px-2 py-0.5 font-mono text-xs text-neon-cyan">
              LVL {f.profile.level}
            </span>
          </button>
        ))
      )}

      {viewing && (
        <ProfileView
          userId={viewing.profile.id}
          initialName={viewing.profile.display_name}
          initialAvatar={viewing.profile.avatar_id}
          onClose={() => setViewing(null)}
          onUnfriend={() => unfriend(viewing.friendshipId)}
        />
      )}
    </section>
  );
}
