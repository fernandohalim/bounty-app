// components/ui/nav-row.tsx  (NEW FILE)
import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";

const cls =
  "block w-full rounded-pill border border-line bg-surface-2 py-3 text-center font-semibold text-ink transition active:scale-95";

// Full-width settings/nav row. Pass `href` for a link, `onClick` for a button.
export function NavRow({
  href,
  onClick,
  className = "",
  children,
}: {
  href?: ComponentProps<typeof Link>["href"];
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  if (href !== undefined) {
    return (
      <Link href={href} className={`${cls} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${cls} ${className}`}>
      {children}
    </button>
  );
}
