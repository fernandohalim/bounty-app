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
    version: "1.4.1",
    date: "June 2026",
    title: "Edits that actually stick 🔧",
    badge: "patch",
    features: [
      "Editing an expense now keeps its bounty card in sync across every group — amount, category and note update instead of drifting, and the card leaves a group's feed if you move it to a category that group isn't watching",
      "Deleting an expense clears its bounty cards too — no more ghost cards stuck in group feeds",
      "Group feeds update live when a card is edited or removed, not only when new ones arrive",
      "Editing or deleting an expense from Home now opens the same quick detail card as History, instead of the old full-page editor",
      "An expense only appears in a group if it happened after the group was formed — no more cards that show in the feed but never count on the leaderboard",
    ],
  },
  {
    version: "1.4",
    date: "June 2026",
    title: "Home & Groups, refreshed 💬",
    badge: "feature",
    features: [
      "Groups list now reads like a chat home — each group shows its last activity, type, and when it ends",
      "Home's Today card now lists only today's expenses (up to 5), not your all-time recent",
      "Budget-blowout messages now name who blew it",
      "Retired the hide-my-coins option entirely — bounty cards always show the amount now, keeping the feed honest",
      "The invite code moved to the group info page and is tap-to-copy",
    ],
  },
  {
    version: "1.3.3",
    date: "June 2026",
    title: "Tap to see anyone 👤",
    badge: "patch",
    features: [
      "Tap any friend — in your friends list or on the leaderboard — to see their full profile: level, XP, streaks and trophy room, in a quick pop-up",
      "Unfriend someone right from their profile, with a confirm so it's never an accident",
      "Retired the head-to-head VS screen — a friend's profile now tells the whole story in one tap",
    ],
  },
  {
    version: "1.3.2",
    date: "June 2026",
    title: "Profiles, toggles & editable recurring ✏️",
    badge: "patch",
    features: [
      "Notification settings traded their tickboxes for sliding toggles — on/off is obvious at a glance now",
      "Changing your avatar no longer fires the moment you tap one — pick it, then confirm with Save",
      "A new Edit profile sheet rolls your display name and avatar change into one place",
      "Recurring expenses are editable at last — tap one in History to change its amount, category, note, cadence or next charge date, or stop it, just like a normal expense",
    ],
  },
  {
    version: "1.3.1",
    date: "June 2026",
    title: "Cleaner category donut 🍩",
    badge: "patch",
    features: [
      "The month total now sits above the category breakdown instead of crammed inside the donut",
      "Tapping a slice fills the donut's center with that category and its share of your spending",
    ],
  },
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
