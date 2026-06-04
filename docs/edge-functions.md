# supabase edge functions log

## push-fanout

```ts
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { db: { schema: "bounty" }, auth: { persistSession: false } },
);

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;

const CATEGORY_LABEL: Record<string, string> = {
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Fun",
  bills: "Bills",
  health: "Health",
  education: "Education",
  groceries: "Groceries",
  savings: "Savings",
  other: "Other",
};
const REACTION_EMOJI: Record<string, string> = {
  fire: "🔥",
  coin_shower: "🪙",
  skull: "💀",
  clown: "🤡",
  eyes: "👀",
  crown: "👑",
};
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

type Payload = { title: string; body: string; url: string };

async function sendToUser(userId: string, flag: string, payload: Payload) {
  const { data: settings } = await admin
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (settings && (settings as Record<string, unknown>)[flag] === false) return;

  const { data: tokens } = await admin
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId);

  for (const t of tokens ?? []) {
    try {
      await webpush.sendNotification(
        JSON.parse(t.token),
        JSON.stringify(payload),
      );
    } catch (err) {
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await admin
          .from("push_tokens")
          .delete()
          .eq("user_id", userId)
          .eq("token", t.token);
      } else {
        console.error("push send error", code);
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const { table, record } = await req.json();

  try {
    if (table === "group_messages") {
      const groupId = record.group_id;
      const { data: group } = await admin
        .from("groups")
        .select("name")
        .eq("id", groupId)
        .maybeSingle();
      const gname = group?.name ?? "your group";
      const url = `/groups/${groupId}`;
      const { data: members } = await admin
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (record.type === "bounty_card") {
        const { data: sender } = await admin
          .from("profiles")
          .select("display_name")
          .eq("id", record.sender_id)
          .maybeSingle();
        const who = sender?.display_name ?? "Someone";
        const cat = CATEGORY_LABEL[record.category] ?? "something";
        const amt = `🪙${fmt(record.amount ?? 0)}`;
        const payload = {
          title: `🎯 New bounty · ${gname}`,
          body: `${who} dropped ${amt} on ${cat}`,
          url,
        };
        for (const m of members ?? [])
          if (m.user_id !== record.sender_id)
            await sendToUser(m.user_id, "on_bounty_card", payload);
      } else if (record.type === "budget_blowout") {
        const payload = {
          title: `💸 Budget blowout · ${gname}`,
          body: record.body ?? "A member blew their budget",
          url,
        };
        for (const m of members ?? [])
          if (m.user_id !== record.sender_id)
            await sendToUser(m.user_id, "on_budget_alert", payload);
      }
    } else if (table === "reactions") {
      const { data: msg } = await admin
        .from("group_messages")
        .select("sender_id, group_id")
        .eq("id", record.message_id)
        .maybeSingle();
      if (msg?.sender_id && msg.sender_id !== record.user_id) {
        const { data: reactor } = await admin
          .from("profiles")
          .select("display_name")
          .eq("id", record.user_id)
          .maybeSingle();
        const emoji = REACTION_EMOJI[record.type] ?? "✨";
        await sendToUser(msg.sender_id, "on_reaction", {
          title: `${emoji} ${reactor?.display_name ?? "Someone"} reacted`,
          body: "to your bounty",
          url: `/groups/${msg.group_id}`,
        });
      }
    } else if (table === "friendships") {
      if (record.status === "pending") {
        const { data: requester } = await admin
          .from("profiles")
          .select("display_name")
          .eq("id", record.requester_id)
          .maybeSingle();
        await sendToUser(record.addressee_id, "on_friend_request", {
          title: "👋 New friend request",
          body: `${requester?.display_name ?? "Someone"} wants to be friends`,
          url: "/friends",
        });
      }
    }
  } catch (e) {
    console.error("fanout error", e);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```
