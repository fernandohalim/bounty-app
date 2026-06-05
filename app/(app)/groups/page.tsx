import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinGroup } from "@/components/join-group";
import { getUserId } from "@/lib/supabase/user";
import { GroupInvites } from "@/components/group-invites";

export default async function GroupsPage() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: invites } = await supabase
    .from("group_invitations")
    .select(
      `id, group_name,
     inviter:profiles!group_invitations_inviter_id_fkey(display_name, avatar_id, username)`,
    )
    .eq("invitee_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: memberships } = await supabase
    .from("group_members")
    .select(
      "group:groups!group_members_group_id_fkey(id, name, kind, status, expires_at)",
    )
    .eq("user_id", userId);

  type G = {
    id: string;
    name: string;
    kind: string;
    status: string;
    expires_at: string | null;
  };
  const groups = ((memberships ?? []) as unknown as { group: G }[])
    .map((m) => m.group)
    .filter(Boolean);

  const groupIds = groups.map((g) => g.id);
  const { data: lastMsgs } = groupIds.length
    ? await supabase
        .from("group_messages")
        .select("group_id, created_at")
        .in("group_id", groupIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const lastActivity = new Map<string, string>();
  for (const m of lastMsgs ?? []) {
    if (!lastActivity.has(m.group_id))
      lastActivity.set(m.group_id, m.created_at);
  }

  return (
    <main className="flex flex-col gap-6 px-5 pb-4 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-ink text-3xl">Groups</h1>
        <Link
          href="/groups/new"
          className="rounded-pill bg-neon-cyan px-4 py-2 font-display font-bold text-xl text-void shadow-glow-cyan active:scale-95"
        >
          + New
        </Link>
      </div>

      {invites && invites.length > 0 && (
        <GroupInvites
          invites={
            invites as unknown as Parameters<typeof GroupInvites>[0]["invites"]
          }
        />
      )}

      <JoinGroup />

      <section className="flex flex-col gap-2">
        {groups.length === 0 ? (
          <div className="surface-card px-6 py-8 text-center text-xs font-mono text-ink-dim">
            no groups yet. create one or join with a code.
          </div>
        ) : (
          groups.map((g) => {
            const last = lastActivity.get(g.id);
            const locked = g.status === "locked";
            return (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="surface-card flex items-center gap-3 px-4 py-3.5 active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card border border-line bg-surface-2 font-display text-lg font-bold text-neon-cyan">
                  {g.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display font-bold text-ink">
                      {g.name}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] text-ink-dim">
                      {relativeTime(last)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate font-mono text-[11px] text-ink-dim">
                      {g.kind === "temporal" ? "temporal ⏳" : "permanent ♾️"}
                      {g.expires_at && g.status === "active"
                        ? ` · ends ${new Date(g.expires_at).toLocaleDateString()}`
                        : ""}
                    </span>
                    {locked && (
                      <span className="ml-auto shrink-0 rounded-pill bg-gold/15 px-2 py-0.5 font-mono text-[10px] text-gold">
                        locked 🏁
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </main>
  );
}

function relativeTime(iso?: string): string {
  if (!iso) return "no activity yet";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
