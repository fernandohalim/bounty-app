export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-5">
      <span className="animate-pulse-glow flex h-12 w-12 items-center justify-center rounded-full bg-neon-cyan/20 text-2xl">
        🪙
      </span>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
        loading…
      </p>
    </main>
  );
}
