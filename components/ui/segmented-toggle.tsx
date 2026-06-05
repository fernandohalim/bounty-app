// components/ui/segmented-toggle.tsx  (NEW FILE)
const accents = {
  cyan: "bg-neon-cyan text-void",
  violet: "bg-neon-violet text-void",
  lime: "bg-neon-lime text-void",
};

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  accent = "cyan",
  fullWidth = false,
  className = "",
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  accent?: keyof typeof accents;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex rounded-pill border border-line bg-surface p-1 ${className}`}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-pill text-xs font-mono font-bold lowercase transition ${
              fullWidth ? "flex-1 py-2" : "px-4 py-1.5"
            } ${on ? accents[accent] : "text-ink-dim"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
