"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { categoryMeta, type Category } from "@/lib/categories";
import { REACTIONS, reactionEmoji, type ReactionType } from "@/lib/reactions";
import { avatarEmoji } from "@/lib/avatars";
import { formatCoins } from "@/lib/format";

export type Member = {
  user_id: string;
  role: string;
  profile: { display_name: string; avatar_id: string; username: string };
};
export type Reaction = { id: string; user_id: string; type: ReactionType };
export type Message = {
  id: string;
  type: string;
  sender_id: string | null;
  category: string | null;
  amount: number | null;
  note: string | null;
  body: string | null;
  created_at: string;
  reactions: Reaction[];
};
export type Group = {
  id: string;
  name: string;
  kind: string;
  status: string;
  expires_at: string | null;
  owner_id: string;
};

type MsgRow = Omit<Message, "reactions">;
type ReactRow = {
  id: string;
  message_id: string;
  user_id: string;
  type: ReactionType;
};

export function GroupFeed({
  groupId,
  me,
  group,
  members,
  initialMessages,
}: {
  groupId: string;
  me: string;
  group: Group;
  members: Member[];
  initialMessages: Message[];
}) {
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [floaters, setFloaters] = useState<
    { key: number; msgId: string; emoji: string }[]
  >([]);
  const floatId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const memberMap = new Map(members.map((m) => [m.user_id, m.profile]));
  const locked = group.status === "locked";

  function spawnFloater(msgId: string, emoji: string) {
    const key = ++floatId.current;
    setFloaters((p) => [...p, { key, msgId, emoji }]);
    setTimeout(() => setFloaters((p) => p.filter((f) => f.key !== key)), 1200);
  }

  function addReaction(msgId: string, r: Reaction) {
    let isNew = false;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || m.reactions.some((x) => x.id === r.id)) return m;
        isNew = true;
        return { ...m, reactions: [...m.reactions, r] };
      }),
    );
    if (isNew) spawnFloater(msgId, reactionEmoji(r.type));
  }

  function removeReaction(msgId: string, reactionId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reactions: m.reactions.filter((x) => x.id !== reactionId) }
          : m,
      ),
    );
  }

  useEffect(() => {
    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "bounty",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const m = payload.new as unknown as MsgRow;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id)
              ? prev
              : [...prev, { ...m, reactions: [] }],
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "bounty", table: "reactions" },
        (payload) => {
          const r = payload.new as unknown as ReactRow;
          addReaction(r.message_id, {
            id: r.id,
            user_id: r.user_id,
            type: r.type,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "bounty", table: "reactions" },
        (payload) => {
          const r = payload.old as unknown as ReactRow;
          removeReaction(r.message_id, r.id);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "bounty",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const m = payload.new as unknown as MsgRow;
          setMessages((prev) =>
            prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "bounty", table: "group_messages" }, // no filter on purpose — see note
        (payload) => {
          const oldId = (payload.old as { id?: string }).id;
          if (!oldId) return;
          setMessages((prev) => prev.filter((x) => x.id !== oldId));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function toggleReaction(msg: Message, type: ReactionType) {
    const mine = msg.reactions.find((r) => r.user_id === me && r.type === type);
    if (mine) {
      removeReaction(msg.id, mine.id);
      await supabase.from("reactions").delete().eq("id", mine.id);
    } else {
      const { data } = await supabase
        .from("reactions")
        .insert({ message_id: msg.id, user_id: me, type })
        .select()
        .single();
      if (data) addReaction(msg.id, { id: data.id, user_id: me, type });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex flex-col gap-2 border-b border-line bg-void/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/groups" className="text-xl text-ink-dim">
            ←
          </Link>
          <Link href={`/groups/${groupId}/info`} className="flex-1">
            <h1 className="font-display font-bold text-ink">
              {group.name} <span className="text-xs text-ink-dim">ⓘ</span>
            </h1>
            <p className="font-mono text-[11px] text-ink-dim">
              {members.length} members · {group.kind}
              {group.expires_at && !locked
                ? ` · ends ${new Date(group.expires_at).toLocaleDateString()}`
                : ""}
            </p>
          </Link>
          <Link
            href={`/groups/${groupId}/leaderboard`}
            className="text-lg"
            title="Leaderboard"
          >
            🏆
          </Link>
        </div>
      </header>

      {locked && (
        <p className="bg-gold/10 px-5 py-2 text-center text-sm text-gold">
          🏁 This group is locked — read-only.
        </p>
      )}

      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {messages.length === 0 && (
          <div className="surface-card px-6 py-10 text-center text-sm text-ink-dim">
            No bounties yet. Log an expense in a listened category to kick off
            the feed.
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type !== "bounty_card") {
            const who = msg.sender_id
              ? memberMap.get(msg.sender_id)?.display_name
              : null;
            return (
              <p key={msg.id} className="text-center text-xs text-ink-dim">
                {msg.type === "budget_blowout" ? (
                  <>
                    <span className="text-over">{who ?? "Someone"}</span>{" "}
                    {msg.body}
                  </>
                ) : msg.type === "limit_change" ? (
                  <>
                    <span className="text-neon-cyan">{who ?? "Someone"}</span>{" "}
                    {msg.body} 🪙
                    {formatCoins(msg.amount ?? 0)}
                  </>
                ) : (
                  msg.body
                )}
              </p>
            );
          }
          const sender = msg.sender_id ? memberMap.get(msg.sender_id) : null;
          const cat = msg.category
            ? categoryMeta(msg.category as Category)
            : null;
          const counts = new Map<string, number>();
          msg.reactions.forEach((r) =>
            counts.set(r.type, (counts.get(r.type) ?? 0) + 1),
          );
          const cardFloaters = floaters.filter((f) => f.msgId === msg.id);

          return (
            <div
              key={msg.id}
              className="surface-card relative flex flex-col gap-2 overflow-hidden p-4"
            >
              {cardFloaters.map((f) => (
                <span
                  key={f.key}
                  className="animate-float-up pointer-events-none absolute bottom-10 right-8 text-2xl"
                >
                  {f.emoji}
                </span>
              ))}

              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {avatarEmoji(sender?.avatar_id)}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {sender?.display_name ?? "Someone"}
                </span>
                <span className="ml-auto font-mono text-[11px] text-ink-dim">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {cat && (
                  <span
                    className="rounded-pill px-2 py-0.5 text-xs"
                    style={{ background: `${cat.accent}22`, color: cat.accent }}
                  >
                    {cat.emoji} {cat.label}
                  </span>
                )}
                <span className="ml-auto font-mono font-bold text-ink">
                  {msg.amount == null
                    ? "🪙 —"
                    : `🪙 ${formatCoins(msg.amount)}`}
                </span>
              </div>

              {msg.note && <p className="text-sm text-ink-dim">{msg.note}</p>}

              {counts.size > 0 && (
                <div className="flex flex-wrap gap-1">
                  {[...counts.entries()].map(([t, n]) => (
                    <span
                      key={t}
                      className="rounded-pill bg-surface-2 px-2 py-0.5 text-xs"
                    >
                      {reactionEmoji(t)} {n}
                    </span>
                  ))}
                </div>
              )}

              {!locked && (
                <div className="flex gap-1 border-t border-line pt-2">
                  {REACTIONS.map((r) => {
                    const mine = msg.reactions.some(
                      (x) => x.user_id === me && x.type === r.type,
                    );
                    return (
                      <button
                        key={r.type}
                        onClick={() => toggleReaction(msg, r.type)}
                        className={`rounded-pill px-2 py-1 text-lg transition active:scale-125 ${mine ? "bg-neon-cyan/20" : ""}`}
                      >
                        {r.emoji}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
