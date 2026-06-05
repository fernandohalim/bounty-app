import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationSettings } from "@/components/notification-settings";
import { getUserId } from "@/lib/supabase/user";

export default async function SettingsPage() {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const { data: s } = await supabase
    .from("notification_settings")
    .select(
      "on_bounty_card, on_reaction, on_friend_request, on_budget_alert, on_group_lock, on_streak_reminder",
    )
    .eq("user_id", userId)
    .maybeSingle();

  const initial = {
    on_bounty_card: s?.on_bounty_card ?? true,
    on_reaction: s?.on_reaction ?? true,
    on_friend_request: s?.on_friend_request ?? true,
    on_budget_alert: s?.on_budget_alert ?? true,
    on_group_lock: s?.on_group_lock ?? true,
    on_streak_reminder: s?.on_streak_reminder ?? true,
  };

  return (
    <main className="flex flex-col gap-6 px-5 pb-6 pt-6">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-xl text-ink-dim">
          ←
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">
          Notifications
        </h1>
      </div>
      <NotificationSettings initial={initial} />
    </main>
  );
}
