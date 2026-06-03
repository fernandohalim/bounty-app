<div align="center">
  <img src="public/icon-512.png" alt="Bounty logo" width="120" />

  # 🪙 Bounty
  **Spend together — the social, gamified expense tracker.**

  [![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React 19](https://img.shields.io/badge/React_19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
  [![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

  [Live Demo](https://bounty-app-iota.vercel.app/) • [Report a Bug](https://github.com/fernandohalim/bounty-app/issues)
</div>

## 👋 What is Bounty?

**Bounty** turns budgeting into a game you play with friends. Log your spending solo, or form groups where every purchase in a watched category broadcasts a **bounty card** to a live feed — friends react in real time, leaderboards keep score, and timed groups crown winners when the clock runs out. It works great as a private tracker on its own, and it's installable on any device as a progressive web app (PWA).

## ✨ Features

* 🪙 **Fast logging:** A silent numeric keypad, fixed categories, and notes — log one-off or recurring expenses in seconds.
* 📊 **Personal dashboard:** Today's total, a weekly budget bar that turns red on a blowout, a category donut, the recurring-vs-one-off split, and a 12-week spending heatmap.
* 💬 **Live bounty feed:** Spend in a group's watched category and a bounty card lands in everyone's feed instantly, powered by Supabase Realtime.
* 🎉 **Reactions:** Hit a bounty with 🔥 🪙 💀 🤡 👀 👑 — reactions float up the card and sync live to every member.
* 🏆 **Gamification:** Climb XP levels, keep daily streaks, unlock avatars, and win titles — The Whale 🐋, The Sniper 🎯, Sticky Fingers 🫳, The Monk 🧘 — that live in your Trophy Room.
* 👥 **Friends & groups:** Add friends by username, then build permanent or timed groups with global, in-group, and head-to-head leaderboards.
* 📱 **PWA + offline:** Install Bounty to your home screen, log expenses offline, and let them auto-sync the moment you reconnect.
* 🔔 **Push notifications:** Get notified about new bounties, reactions, and friend requests — with per-type toggles.
* 🔒 **Secure & authenticated:** Google sign-in, with row-level security on a dedicated Postgres schema so every query is locked to the right user.

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Library:** [React 19](https://react.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database, Auth & Realtime:** [Supabase](https://supabase.com/) (Postgres, RLS, Realtime, Edge Functions)
* **Notifications:** Web Push (VAPID)
* **Type Safety:** TypeScript
* **Fonts:** Unbounded, Plus Jakarta Sans, Martian Mono

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/fernandohalim/bounty.git

# Jump into the directory
cd bounty

# Install the dependencies
npm install

# Add your keys to .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=...

# Start the local development server
npm run dev
```