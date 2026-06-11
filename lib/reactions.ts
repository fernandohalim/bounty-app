import type { Enums } from "@/types/database";

export type ReactionType = Enums<"reaction_type">;

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "coin_shower", emoji: "🪙", label: "Coin Shower" },
  { type: "skull", emoji: "💀", label: "Skull" },
  { type: "clown", emoji: "🤡", label: "Clown" },
  { type: "eyes", emoji: "👀", label: "Eyes" },
  { type: "crown", emoji: "👑", label: "Crown" },
];

export const reactionIcon = (t: string) => `reactions/${t}`;

export const reactionEmoji = (t: string) =>
  REACTIONS.find((r) => r.type === t)?.emoji ?? "❓";