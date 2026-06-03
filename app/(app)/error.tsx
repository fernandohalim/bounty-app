"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">🪙💥</span>
      <h1 className="font-display text-xl font-bold text-ink">
        Something glitched
      </h1>
      <p className="max-w-xs text-sm text-ink-dim">
        That screen failed to load. It&apos;s usually a hiccup — try again.
      </p>
      <button
        onClick={reset}
        className="rounded-pill bg-neon-cyan px-6 py-3 font-display font-bold text-void shadow-glow-cyan active:scale-95"
      >
        Retry
      </button>
    </main>
  );
}
