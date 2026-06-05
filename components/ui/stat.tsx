// components/ui/stat.tsx  (NEW FILE)
import { type ReactNode } from "react";

// The 3-up stat tile used on Home, Profile, and the profile pop-up.
export function Stat({
  label,
  value,
  accent = "text-ink",
}: {
  label: string;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-1 py-4">
      <span className={`font-mono text-xl font-bold ${accent}`}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
        {label}
      </span>
    </div>
  );
}
