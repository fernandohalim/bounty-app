// Group-title badges. The trophies table stores the title's emoji, so we map
// that back to a pixel badge for the trophy room; leaderboard/locked views use
// the icon keys directly.
export const BADGES = {
  whale: { icon: "badges/whale", emoji: "🐋", label: "The Whale" },
  sniper: { icon: "badges/sniper", emoji: "🎯", label: "The Sniper" },
  sticky: { icon: "badges/sticky", emoji: "🫳", label: "Sticky Fingers" },
  monk: { icon: "badges/monk", emoji: "🧘", label: "The Monk" },
} as const;

export const badgeIconForEmoji = (emoji: string): string | null =>
  Object.values(BADGES).find((b) => b.emoji === emoji)?.icon ?? null;