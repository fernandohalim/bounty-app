import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avatarIcon } from "@/lib/avatars";
import { getUserId } from "@/lib/supabase/user";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BADGES } from "@/lib/badges";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { Coins } from "@/components/ui/coins";

export default async function GroupLeaderboard({
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
    .select("name, status")
    .eq("id", id)
    .maybeSingle();
  if (!group) redirect("/groups");

  const { data: rows } = await supabase.rpc("group_leaderboard", {
    p_group: id,
  });
  const board = rows ?? [];

  const top = (key: "total" | "biggest" | "txns") =>
    board.filter((r) => r[key] > 0).sort((a, b) => b[key] - a[key])[0]?.user_id;
  const whale = top("total");
  const sniper = top("biggest");
  const sticky = top("txns");
  const monk = board.slice().sort((a, b) => a.total - b.total)[0]?.user_id;

  const titleIcons = (uid: string) =>
    [
      uid === whale && BADGES.whale.icon,
      uid === sniper && BADGES.sniper.icon,
      uid === sticky && BADGES.sticky.icon,
      uid === monk && BADGES.monk.icon,
    ].filter(Boolean) as string[];

  const ranked = board.slice().sort((a, b) => b.total - a.total);

  return (
    <main className="flex flex-col gap-5 px-5 pb-4 pt-6">
      <div className="flex items-center gap-3">
        <Link href={`/groups/${id}`} className="text-xl text-ink-dim">
          ←
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {group.name}
          </h1>
          <Eyebrow as="p">
            {group.status === "locked" ? (
              <span className="inline-flex items-center gap-1">
                Final standings <PixelIcon name="ui/group-locked" size={12} />
              </span>
            ) : (
              "Live standings"
            )}
          </Eyebrow>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        {ranked.length === 0 && (
          <div className="surface-card px-6 py-8 text-center text-sm text-ink-dim">
            No spending tracked yet.
          </div>
        )}
        {ranked.map((r, i) => (
          <div
            key={r.user_id}
            className={`surface-card flex items-center gap-3 px-4 py-3 ${r.user_id === userId ? "border-neon-cyan" : ""}`}
          >
            <span className="w-5 text-center font-mono text-sm font-bold text-ink-dim">
              {i + 1}
            </span>
            <PixelIcon name={avatarIcon(r.avatar_id)} size={24} />{" "}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate font-display text-ink">
                <span className="truncate">{r.display_name}</span>
                {titleIcons(r.user_id).map((icon) => (
                  <PixelIcon key={icon} name={icon} size={14} />
                ))}
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px] text-ink-dim">
                {r.txns} txns · max <Coins amount={r.biggest} size={12} />
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-ink">
              <Coins amount={r.total} size={14} />
            </span>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap justify-center gap-3 text-xs text-ink-dim">
        <span className="flex items-center gap-1">
          <PixelIcon name="badges/whale" size={14} /> Whale
        </span>
        <span className="flex items-center gap-1">
          <PixelIcon name="badges/sniper" size={14} /> Sniper
        </span>
        <span className="flex items-center gap-1">
          <PixelIcon name="badges/sticky" size={14} /> Sticky Fingers
        </span>
        <span className="flex items-center gap-1">
          <PixelIcon name="badges/monk" size={14} /> Monk
        </span>
      </div>
    </main>
  );
}
