// components/ui/modal.tsx  (NEW FILE)
import { type ReactNode } from "react";

// Bottom-sheet on mobile, centered card on sm+. Backdrop closes on click.
// Pass extra card classes via className (e.g. scroll/flex/gap variants).
export function Modal({
  onClose,
  className = "",
  children,
}: {
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-void/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`animate-pop-in relative z-10 w-full max-w-md rounded-t-card border border-line bg-surface p-5 sm:rounded-card ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
