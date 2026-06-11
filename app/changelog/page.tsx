"use client";

import { useRouter } from "next/navigation";
import packageJson from "../../package.json";
import { releases, type ReleaseBadge } from "@/lib/changelog";
import { PixelIcon } from "@/components/ui/pixel-icon";

const ACCENT: Record<
  ReleaseBadge,
  { bar: string; chip: string; marker: string; glow: string }
> = {
  launch: {
    bar: "bg-neon-cyan",
    chip: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40",
    marker: "text-neon-cyan",
    glow: "shadow-glow-cyan ring-1 ring-neon-cyan",
  },
  feature: {
    bar: "bg-neon-violet",
    chip: "bg-neon-violet/15 text-neon-violet border-neon-violet/40",
    marker: "text-neon-violet",
    glow: "",
  },
  patch: {
    bar: "bg-neon-lime",
    chip: "bg-neon-lime/15 text-neon-lime border-neon-lime/40",
    marker: "text-neon-lime",
    glow: "",
  },
};

function markerFor(badge: ReleaseBadge): string {
  return badge === "patch" ? "~" : "+";
}

export default function Changelog() {
  const router = useRouter();
  const currentVersion = packageJson.version;

  return (
    <main className="min-h-dvh bg-void">
      <header className="sticky top-0 z-20 border-b border-line bg-void/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-pill border border-line bg-surface-2 px-3 py-1.5 text-sm text-ink-dim transition hover:text-ink active:scale-95"
          >
            <span>←</span> back
          </button>
          <div className="flex items-center gap-2">
            <PixelIcon name="brand/coin" size={16} />
            <span className="font-display text-sm font-bold text-ink">
              changelog
            </span>
          </div>
          <span className="rounded-pill border border-neon-cyan/40 bg-neon-cyan/10 px-2 py-0.5 font-mono text-[11px] text-neon-cyan">
            v{currentVersion}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 pb-28 pt-8">
        <div className="mb-8">
          <h1 className="text-neon font-display text-4xl font-bold">
            Changelog
          </h1>
          <p className="mt-1 font-mono text-xs text-ink-dim">
            {releases.length} releases · newest first
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {releases.map((release) => {
            const isCurrent = release.version === currentVersion;
            const a = ACCENT[release.badge];
            return (
              <article
                key={release.version}
                id={`v${release.version}`}
                className={`surface-card animate-pop-in relative overflow-hidden rounded-card p-5 pl-6 ${
                  isCurrent ? a.glow : ""
                }`}
              >
                <span className={`absolute inset-y-0 left-0 w-1.5 ${a.bar}`} />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-pill border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink">
                    v{release.version}
                  </span>
                  <span
                    className={`rounded-pill border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${a.chip}`}
                  >
                    {release.badge}
                  </span>
                  {isCurrent && (
                    <span className="rounded-pill bg-neon-cyan px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-void">
                      current
                    </span>
                  )}
                  <time className="ml-auto font-mono text-xs text-ink-dim">
                    {release.date}
                  </time>
                </div>

                <h2 className="mt-2.5 font-display text-lg font-bold text-ink">
                  {release.title}
                </h2>

                <ul className="mt-3 flex flex-col gap-2">
                  {release.features.map((feature, fi) => (
                    <li key={fi} className="flex gap-2.5 text-sm">
                      <span
                        className={`shrink-0 select-none font-mono font-bold ${a.marker}`}
                      >
                        {markerFor(release.badge)}
                      </span>
                      <span className="leading-relaxed text-ink-dim">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center font-mono text-xs text-ink-dim">
          more bounties incoming…
        </p>
      </div>
    </main>
  );
}
