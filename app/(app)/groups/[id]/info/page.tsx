import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarEmoji } from "@/lib/avatars";
import { categoryMeta, type Category } from "@/lib/categories";
import { InviteFriends } from "@/components/invite-friends";
import { GroupActions } from "@/components/group-actions";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, kind, status, expires_at, owner_id, created_at")
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
  };
  type FrRow = {
    requester_id: string;
    addressee_id: string;
    requester: Prof;
    addressee: Prof;
  };

  const memberRows = (members ?? []) as unknown as MemberRow[];
  const memberIds = new Set(memberRows.map((m) => m.user_id));
  const friends = ((fr ?? []) as unknown as FrRow[]).map((r) =>
    r.requester_id === user.id ? r.addressee : r.requester,
  );
  const invitable = friends.filter((f) => !memberIds.has(f.id));

  const isOwner = group.owner_id === user.id;
  const isActive = group.status === "active";

  return (
    <main className="flex flex-col gap-6 px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${id}`} className="text-xl text-ink-dim">
          ←
        </Link>
        <h1 className="font-display text-xl font-bold text-ink">
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
        {invite && isActive && (
          <Row label="Invite code" value={invite.code} mono />
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

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          Members · {memberRows.length}
        </h2>
        {memberRows.map((m) => (
          <div
            key={m.user_id}
            className="surface-card flex items-center gap-3 px-4 py-3"
          >
            <span className="text-2xl">{avatarEmoji(m.profile.avatar_id)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">
                {m.profile.display_name}
              </p>
              <p className="font-mono text-xs text-ink-dim">
                @{m.profile.username}
              </p>
            </div>
            {m.role === "owner" && (
              <span className="rounded-pill bg-gold/15 px-2 py-0.5 font-mono text-[10px] text-gold">
                owner
              </span>
            )}
            <span className="rounded-pill bg-neon-cyan/10 px-2 py-0.5 font-mono text-xs text-neon-cyan">
              LVL {m.profile.level}
            </span>
          </div>
        ))}
      </section>

      {isActive && <InviteFriends groupId={id} friends={invitable} />}

      <GroupActions groupId={id} isOwner={isOwner} />
    </main>
  );
}
