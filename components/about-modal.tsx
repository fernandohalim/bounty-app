"use client";

import { useRouter } from "next/navigation";
import packageJson from "../package.json";
import { PixelIcon } from "./ui/pixel-icon";

type AboutModalProps = { isOpen: boolean; onClose: () => void };

const SOCIALS = [
  { label: "Website", href: "https://fernando-halim.vercel.app" },
  { label: "LinkedIn", href: "https://linkedin.com/in/fernando-halimm" },
  { label: "GitHub", href: "https://github.com/fernandohalim" },
  { label: "Mail", href: "mailto:fernandohalim26@gmail.com" },
];

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(40rem 30rem at 50% 0%, rgba(46,230,255,0.12), transparent 70%), rgba(10,9,19,0.8)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="animate-pop-in relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-surface shadow-glow-cyan">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-2 text-lg leading-none text-ink-dim transition hover:text-ink active:scale-90"
        >
          ×
        </button>

        <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center">
          <div className="animate-pulse-glow mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-surface-2 shadow-glow-cyan">
            <PixelIcon name="brand/coin" size={56} />
          </div>

          <h2 className="text-neon font-display text-3xl font-bold">BOUNTY</h2>
          <p className="mb-6 mt-1 text-sm text-ink-dim">
            Spend together, gamified.
          </p>

          <div className="flex w-full flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                router.push("/changelog");
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-neon-cyan/30 bg-surface-2 px-4 py-3 text-left transition hover:border-neon-cyan/70 hover:shadow-glow-cyan active:scale-[0.98]"
            >
              <PixelIcon name="ui/changelog" size={20} />
              <span className="flex-1 text-sm font-semibold text-ink">
                Changelog
              </span>
              <span className="rounded-pill bg-neon-cyan/15 px-2 py-0.5 font-mono text-xs text-neon-cyan">
                v{packageJson.version} →
              </span>
            </button>

            <a
              href="https://github.com/fernandohalim/bounty-app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-2xl border border-neon-violet/30 bg-surface-2 px-4 py-3 text-left transition hover:border-neon-violet/70 active:scale-[0.98]"
            >
              <PixelIcon name="ui/code" size={20} />
              <span className="flex-1 text-sm font-semibold text-ink">
                Source Code
              </span>
              <span className="font-mono text-xs text-neon-violet">
                GitHub ↗
              </span>
            </a>

            <div className="mt-1 grid grid-cols-4 gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-pill border border-line bg-surface-2 py-2.5 font-mono text-xs text-ink-dim transition hover:border-neon-cyan/50 hover:text-neon-cyan active:scale-95"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <p className="mt-7 font-mono text-[11px] uppercase tracking-widest text-ink-dim">
            crafted by Fernando Halim
          </p>
        </div>
      </div>
    </div>
  );
}
