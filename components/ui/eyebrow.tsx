// components/ui/eyebrow.tsx  (NEW FILE)
import { type ElementType, type ReactNode } from "react";

type Tone = "dim" | "pink" | "gold";

const tones: Record<Tone, string> = {
  dim: "text-ink-dim",
  pink: "text-neon-pink",
  gold: "text-gold",
};

// The uppercase mono section label (text-xs). Color via `tone` to avoid
// className conflicts; element via `as` (h2 default, sometimes h3/p/span).
export function Eyebrow({
  as: Tag = "h2",
  tone = "dim",
  className = "",
  children,
}: {
  as?: ElementType;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`font-mono text-xs uppercase tracking-widest ${tones[tone]} ${className}`}
    >
      {children}
    </Tag>
  );
}
