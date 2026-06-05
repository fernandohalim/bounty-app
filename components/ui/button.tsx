// components/ui/button.tsx  (NEW FILE)
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant =
  | "primary" // lime CTA
  | "accent" // cyan CTA
  | "chip" // filled cyan pill (edit / history / close)
  | "ghost" // neutral outline (cancel / back)
  | "gold" // owner / title actions
  | "danger" // destructive, tinted
  | "dangerSolid" // destructive, filled
  | "neutral"; // filled neutral (full-width Close, etc.)

type Size = "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-pill transition active:scale-95 disabled:opacity-50";

// size also decides the font role: lg = pixel CTA, sm = mono lowercase pill
const sizes: Record<Size, string> = {
  lg: "px-5 py-3 text-base font-display font-bold",
  sm: "px-3 py-1.5 text-xs font-mono lowercase",
};

const variants: Record<Variant, string> = {
  primary: "bg-neon-lime text-void shadow-glow-lime disabled:shadow-none",
  accent: "bg-neon-cyan text-void shadow-glow-cyan disabled:shadow-none",
  chip: "border border-line bg-surface-2 text-neon-cyan",
  ghost: "border border-line text-ink",
  gold: "border border-gold/40 bg-gold/10 text-gold",
  danger: "border border-over/40 bg-over/10 text-over",
  dangerSolid: "bg-over text-void",
  neutral: "border border-line bg-surface-2 text-ink",
};

export type ButtonVariant = Variant;
export type ButtonSize = Size;

export function buttonClasses({
  variant = "primary",
  size = "lg",
  fullWidth = false,
}: { variant?: Variant; size?: Size; fullWidth?: boolean } = {}) {
  return `${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""}`;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  busy?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "lg",
      busy = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || busy}
        className={`${base} ${sizes[size]} ${variants[variant]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export function IconButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-2 text-lg text-ink-dim transition active:scale-90 ${className}`}
      {...props}
    />
  );
}
