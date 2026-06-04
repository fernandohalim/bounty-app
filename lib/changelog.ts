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
    version: "1.3",
    date: "June 2026",
    title: "Logging & history, reborn ⚡",
    badge: "feature",
    features: [
      "Tap + and the add screen now slides up full-screen — categories in a custom dropdown, an exact date & time via a custom picker, and a keypad the keyboard can't shove around anymore",
      "Expenses save with an editable date and time now, not just 'right now'",
      "History got real filters: narrow by month or category, and sort by newest, oldest, biggest, smallest, or A–Z",
      "Expenses are grouped by day with Today / Yesterday headers and show the time you logged them",
      "Tapping an expense opens a detail card first — edit or delete from there, so no more accidental edits",
    ],
  },
  {
    version: "1.2.1",
    date: "June 2026",
    title: "Wipe recurring vs. one-off 🏠",
    badge: "patch",
    features: ["Removing unecessary section in home dashboard"],
  },
  {
    version: "1.2",
    date: "June 2026",
    title: "Home, leveled up 🏠",
    badge: "feature",
    features: [
      "Today and Recent are now one card — today's total, how many you've logged today, and your latest expenses at a glance",
      "Tap any category in the month breakdown to focus it; the donut and bars highlight just that slice",
      "The spending heatmap is tappable now — tap a day to see its date and total (no more invisible hover tooltips on mobile)",
      "Weekly budget input formats with thousand separators as you type",
    ],
  },
  {
    version: "1.1",
    date: "June 2026",
    title: "Faster & fresher 🚀",
    badge: "feature",
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
