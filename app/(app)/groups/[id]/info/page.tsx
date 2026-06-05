import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { categoryMeta, type Category } from "@/lib/categories";
import { InviteFriends } from "@/components/invite-friends";
import { GroupActions } from "@/components/group-actions";
import { getUserId } from "@/lib/supabase/user";
import { InviteCode } from "@/components/invite-code";
import { GroupMembersList } from "@/components/group-members-list";

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-dim">{label}</span>
      <span className={`text-ink ${mono ? "font-mono text-neon-cyan" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function GroupInfo({
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
    .select(
      "id, name, kind, status, expires_at, owner_id, created_at, share_blowout",
    )
    .eq("id", id)
    .maybeSingle();
  if (!group) redirect("/groups");

  const { data: members } = await supabase
    .from("group_members")
    .select(
      "user_id, role, profile:profiles!group_members_user_id_fkey(display_name, avatar_id, username, level)",
    )
    .eq("group_id", id);

  const { data: cats } = await supabase
    .from("group_listened_categories")
    .select("category")
    .eq("group_id", id);

  const { data: invite } = await supabase
    .from("group_invites")
    .select("code")
    .eq("group_id", id)
    .limit(1)
    .maybeSingle();

  const { data: pendingInv } = await supabase
    .from("group_invitations")
    .select("invitee_id")
    .eq("group_id", id)
    .eq("status", "pending");

  const { data: fr } = await supabase
    .from("friendships")
    .select(
      `requester_id, addressee_id,
       requester:profiles!friendships_requester_id_fkey(id, display_name, avatar_id, username),
       addressee:profiles!friendships_addressee_id_fkey(id, display_name, avatar_id, username)`,
    )
    .eq("status", "accepted");

  type Prof = {
    id: string;
    display_name: string;
    avatar_id: string;
    username: string;
  };
  type MemberRow = {
    user_id: string;
    role: string;
    profile: Prof & { level: number };
    hide_amount: boolean;
  };
  type FrRow = {
    requester_id: string;
    addressee_id: string;
    requester: Prof;
    addressee: Prof;
  };

  const memberRows = (members ?? []) as unknown as MemberRow[];
  const flatMembers = memberRows.map((m) => ({
    user_id: m.user_id,
    role: m.role,
    display_name: m.profile.display_name,
    avatar_id: m.profile.avatar_id,
    username: m.profile.username,
    level: m.profile.level,
  }));
  const memberIds = new Set(memberRows.map((m) => m.user_id));
  const friends = ((fr ?? []) as unknown as FrRow[]).map((r) =>
    r.requester_id === userId ? r.addressee : r.requester,
  );
  const pendingIds = new Set((pendingInv ?? []).map((p) => p.invitee_id));
  const invitable = friends.filter(
    (f) => !memberIds.has(f.id) && !pendingIds.has(f.id),
  );
  const isOwner = group.owner_id === userId;
  const isActive = group.status === "active";

  return (
    <main className="flex flex-col gap-6 px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${id}`} className="text-xl text-ink-dim">
          ←
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">
          {group.name}
        </h1>
      </div>

      <section className="surface-card flex flex-col gap-2 p-5 text-sm">
        <Row
          label="Type"
          value={group.kind === "temporal" ? "Temporal ⏳" : "Permanent ♾️"}
        />
        <Row
          label="Formed"
          value={new Date(group.created_at).toLocaleDateString()}
        />
        {group.kind === "temporal" && (
          <Row
            label={isActive ? "Ends" : "Ended"}
            value={
              group.expires_at
                ? new Date(group.expires_at).toLocaleDateString()
                : "—"
            }
          />
        )}
        <Row label="Status" value={isActive ? "Active" : "Locked 🏁"} />
        <Row
          label="Shared blowouts"
          value={group.share_blowout ? "On 👀" : "Off"}
        />
        {invite && isActive && (
          <div className="flex justify-between">
            <span className="text-ink-dim">Invite code</span>
            <InviteCode code={invite.code} />
          </div>
        )}
        <div className="flex flex-wrap gap-1 pt-1">
          {(cats ?? []).map((c) => {
            const m = categoryMeta(c.category as Category);
            return (
              <span
                key={c.category}
                className="rounded-pill bg-surface-2 px-2 py-0.5 text-[10px] text-ink-dim"
              >
                {m.emoji} {m.label}
              </span>
            );
          })}
        </div>
      </section>

      <GroupMembersList groupId={id} members={flatMembers} isOwner={isOwner} />

      {isActive && <InviteFriends groupId={id} friends={invitable} />}

      <GroupActions groupId={id} isOwner={isOwner} />
    </main>
  );
}
