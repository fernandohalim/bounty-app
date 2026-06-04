import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  GroupFeed,
  type Group,
  type Member,
  type Message,
} from "@/components/group-feed";
import { LockedGroupView, type Final } from "@/components/locked-group-view";
import { getUserId } from "@/lib/supabase/user";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, kind, status, expires_at, owner_id, final_leaderboard")
    .eq("id", id)
    .maybeSingle();
  if (!group) redirect("/groups");

  if (group.status === "locked") {
    return (
      <LockedGroupView
        groupName={group.name}
        final={group.final_leaderboard as unknown as Final | null}
        me={userId}
      />
    );
  }

  const { data: members } = await supabase
    .from("group_members")
    .select(
      "user_id, role, profile:profiles!group_members_user_id_fkey(display_name, avatar_id, username)",
    )
    .eq("group_id", id);
  const { data: messages } = await supabase
    .from("group_messages")
    .select(
      "id, type, sender_id, category, amount, note, body, created_at, reactions(id, user_id, type)",
    )
    .eq("group_id", id)
    .order("created_at", { ascending: true });

  return (
    <GroupFeed
      groupId={id}
      me={userId}
      group={group as unknown as Group}
      members={(members ?? []) as unknown as Member[]}
      initialMessages={(messages ?? []) as unknown as Message[]}
    />
  );
}
