"use client";

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-pill border transition-colors duration-200 active:scale-95 disabled:opacity-50 ${
        checked
          ? "border-neon-cyan/60 bg-neon-cyan/20"
          : "border-line bg-surface-2"
      }`}
    >
      <span
        className={`absolute left-0.75 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          checked
            ? "translate-x-5 bg-neon-cyan shadow-glow-cyan"
            : "translate-x-0 bg-ink-dim"
        }`}
      />
    </button>
  );
}
