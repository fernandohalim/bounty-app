"use client";

import { Button } from "@/components/ui/button";
import { PixelIcon } from "@/components/ui/pixel-icon";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <PixelIcon name="brand/coin-crash" size={56} />
      <h1 className="font-display text-xl font-bold text-ink">
        Something glitched
      </h1>
      <p className="max-w-xs text-sm text-ink-dim">
        That screen failed to load. It&apos;s usually a hiccup — try again.
      </p>
      <Button variant="accent" onClick={reset}>
        Retry
      </Button>
    </main>
  );
}
