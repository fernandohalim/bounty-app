"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAddSheet } from "@/components/add-sheet";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "🏠", enabled: true },
  { href: "/groups", label: "Groups", icon: "💬", enabled: true },
  { href: "/add", label: "Add", icon: "＋", center: true, enabled: true },
  { href: "/leaderboards", label: "Ranks", icon: "🏆", enabled: true },
  { href: "/profile", label: "You", icon: "🎮", enabled: true },
];

export function BottomNav() {
  const path = usePathname();
  const { open } = useAddSheet();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-end justify-around border-t border-line bg-surface/90 px-2 pb-3 pt-2 backdrop-blur">
      {NAV.map((item) => {
        const active = path === item.href || path.startsWith(item.href + "/");

        if (item.center) {
          const Center = (
            <div
              className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full font-display text-3xl text-void transition ${
                item.enabled
                  ? "bg-neon-cyan shadow-glow-cyan active:scale-90"
                  : "bg-line text-ink-dim"
              }`}
            >
              {item.icon}
            </div>
          );
          return (
            <button key={item.href} onClick={open} aria-label="Add expense">
              {Center}
            </button>
          );
        }

        const inner = (
          <span
            className={`flex flex-col items-center gap-0.5 text-xs ${
              active
                ? "text-neon-cyan"
                : item.enabled
                  ? "text-ink-dim"
                  : "text-ink-dim/40"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </span>
        );

        return item.enabled ? (
          <Link key={item.href} href={item.href} className="w-14 py-1">
            {inner}
          </Link>
        ) : (
          <div key={item.href} className="w-14 py-1" aria-disabled>
            {inner}
          </div>
        );
      })}
    </nav>
  );
}
