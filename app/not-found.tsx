import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">👻</span>
      <h1 className="font-display text-2xl font-bold text-ink">
        Lost in the void
      </h1>
      <p className="text-sm text-ink-dim">That page doesn&apos;t exist.</p>
      <Link
        href="/dashboard"
        className="rounded-pill bg-neon-lime px-6 py-3 font-display font-bold text-void shadow-glow-lime active:scale-95"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
