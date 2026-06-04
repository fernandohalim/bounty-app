import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { AddFriend } from "@/components/add-friend";
import { IncomingRequests } from "@/components/incoming-requests";
import { getUserId } from "@/lib/supabase/user";
import { FriendsList } from "@/components/friends-list";

type Prof = {
  id: string;
  username: string;
  display_name: string;
  avatar_id: string;
  level: number;
};

export default async function FriendsPage() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  const { data: rows } = await supabase
    .from("friendships")
    .select(
      `id, requester_id, addressee_id, status,
       requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_id, level),
       addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_id, level)`,
    )
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    requester_id: string;
    addressee_id: string;
    status: "pending" | "accepted";
    requester: Prof;
    addressee: Prof;
  };

  const all = (rows ?? []) as unknown as Row[];
  const otherOf = (r: Row): Prof =>
    r.requester_id === userId ? r.addressee : r.requester;

  const incoming = all
    .filter((r) => r.status === "pending" && r.addressee_id === userId)
    .map((r) => ({ id: r.id, profile: r.requester }));
  const outgoing = all
    .filter((r) => r.status === "pending" && r.requester_id === userId)
    .map((r) => ({ id: r.id, profile: r.addressee }));
  const friends = all
    .filter((r) => r.status === "accepted")
    .map((r) => ({ friendshipId: r.id, profile: otherOf(r) }));

  return (
    <main className="flex flex-col gap-6 px-5 pb-4 pt-8">
      <h1 className="font-display text-2xl font-bold text-ink">Friends</h1>

      <AddFriend myUsername={me?.username ?? ""} />

      {incoming.length > 0 && <IncomingRequests requests={incoming} />}

      {outgoing.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
            Sent · {outgoing.length}
          </h2>
          {outgoing.map((o) => (
            <div
              key={o.id}
              className="surface-card flex items-center gap-3 px-4 py-3"
            >
              <span className="text-2xl">
                {avatarEmoji(o.profile.avatar_id)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  {o.profile.display_name}
                </p>
                <p className="font-mono text-xs text-ink-dim">
                  @{o.profile.username}
                </p>
              </div>
              <span className="font-mono text-xs text-ink-dim">pending</span>
            </div>
          ))}
        </section>
      )}

      <FriendsList friends={friends} />
    </main>
  );
}
