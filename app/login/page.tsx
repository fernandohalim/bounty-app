import { GoogleButton } from "@/components/google-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="animate-pop-in flex flex-col items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
          Neon Arcade
        </span>
        <h1 className="text-neon font-display text-6xl font-bold">BOUNTY</h1>
        <p className="max-w-xs text-sm text-ink-dim">
          Spend together. Track expenses, broadcast bounties, climb the
          leaderboard.
        </p>
      </div>

      {error && (
        <p className="rounded-pill border border-over/40 bg-over/10 px-4 py-2 text-sm text-over">
          Couldn&apos;t sign you in. Try again.
        </p>
      )}

      <GoogleButton />
    </main>
  );
}
