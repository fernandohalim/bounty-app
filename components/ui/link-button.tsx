// components/ui/link-button.tsx  (NEW FILE)
import Link from "next/link";
import { type ComponentProps } from "react";
import { buttonClasses, type ButtonVariant, type ButtonSize } from "./button";

export function LinkButton({
  variant,
  size,
  fullWidth,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return (
    <Link
      className={`${buttonClasses({ variant, size, fullWidth })} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
