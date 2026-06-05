// components/ui/text-input.tsx  (NEW FILE)
import { forwardRef, type InputHTMLAttributes } from "react";

type Tone = "surface" | "surface2"; // field bg: surface2 on cards, surface on void
type Size = "md" | "sm";

const tones: Record<Tone, string> = {
  surface: "bg-surface",
  surface2: "bg-surface-2",
};
const sizes: Record<Size, string> = {
  md: "px-4 py-2.5",
  sm: "px-4 py-2 text-xs",
};

export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  tone?: Tone;
  size?: Size;
  mono?: boolean; // standard font by default; mono for codes/amounts
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { tone = "surface2", size = "md", mono = false, className = "", ...props },
    ref,
  ) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-pill border border-line text-ink outline-none placeholder:text-ink-dim/50 ${tones[tone]} ${sizes[size]} ${
          mono ? "font-mono" : ""
        } ${className}`}
        {...props}
      />
    );
  },
);
