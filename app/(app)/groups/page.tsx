import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinGroup } from "@/components/join-group";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("group_members")
    .select(
      "group:groups!group_members_group_id_fkey(id, name, kind, status, expires_at)",
    )
    .eq("user_id", user.id);

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

  return (
    <main className="flex flex-col gap-6 px-5 pb-4 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Groups</h1>
        <Link
          href="/groups/new"
          className="rounded-pill bg-neon-cyan px-4 py-2 font-display font-bold text-void shadow-glow-cyan active:scale-95"
        >
          + New
        </Link>
      </div>

      <JoinGroup />

      <section className="flex flex-col gap-2">
        {groups.length === 0 ? (
          <div className="surface-card px-6 py-8 text-center text-sm text-ink-dim">
            No groups yet. Create one or join with a code.
          </div>
        ) : (
          groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="surface-card flex items-center justify-between px-4 py-4"
            >
              <div>
                <p className="font-display font-bold text-ink">{g.name}</p>
                <p className="font-mono text-xs text-ink-dim">
                  {g.kind}
                  {g.expires_at && g.status === "active"
                    ? ` · ends ${new Date(g.expires_at).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              {g.status === "locked" ? (
                <span className="rounded-pill bg-gold/15 px-2 py-1 font-mono text-xs text-gold">
                  locked 🏁
                </span>
              ) : (
                <span className="text-neon-cyan">→</span>
              )}
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
