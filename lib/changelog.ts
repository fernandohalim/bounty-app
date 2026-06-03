export type ReleaseBadge = "launch" | "feature" | "patch";

export type Release = {
  version: string;
  date: string;
  title: string;
  badge: ReleaseBadge;
  features: string[];
};

export const releases: Release[] = [
  {
    version: "1.1",
    date: "June 2026",
    title: "Faster & fresher 🚀",
    badge: "patch",
    features: [
      "Snappier navigation — screens you've visited reuse their data instead of re-fetching everything on every tap",
      "Fixed the bug where groups (and other screens) showed up empty until you manually refreshed",
      "The app no longer serves stale cached pages and now auto-updates to the newest version instead of getting stuck on an old build",
    ],
  },
  {
    version: "1.0",
    date: "June 2026",
    title: "Bounty is Live 🪙",
    badge: "launch",
    features: [
      "Log one-off and recurring expenses with a silent keypad, fixed categories, and notes",
      "A personal dashboard — today's total, a weekly budget bar that turns red on a blowout, a category donut, the recurring-vs-one-off split, and a 12-week spending heatmap",
      "Add friends by username, then form permanent or timed groups that watch the categories you pick",
      "Every spend in a watched category broadcasts a bounty card to the group feed in real time",
      "React with 🔥 🪙 💀 🤡 👀 👑 — reactions float up the card and sync live to everyone",
      "Climb XP levels, keep daily streaks, and unlock avatars as you go",
      "Win titles when a timed group locks — the whale 🐋, the sniper 🎯, sticky fingers 🫳, the monk 🧘 — and keep them in your trophy room",
      "Install it to your home screen, log offline and auto-sync on reconnect, and get push notifications",
    ],
  },
];
