import { formatCoins } from "@/lib/format";

export function Donut({
  segments,
  total,
}: {
  segments: { value: number; color: string }[];
  total: number;
}) {
  let acc = 0;
  const stops =
    total > 0
      ? segments
          .map((s) => {
            const pct = (s.value / total) * 100;
            const seg = `${s.color} ${acc}% ${acc + pct}%`;
            acc += pct;
            return seg;
          })
          .join(", ")
      : "var(--color-surface-2) 0% 100%";

  return (
    <div className="relative h-36 w-36 shrink-0">
      <div
        className="h-full w-full rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      />
      <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-surface">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
          month
        </span>
        <span className="font-mono text-sm font-bold text-ink">
          🪙{formatCoins(total)}
        </span>
      </div>
    </div>
  );
}

export function BarList({
  items,
  max,
}: {
  items: { label: string; emoji: string; value: number; accent: string }[];
  max: number;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span className="w-5 text-center text-sm">{it.emoji}</span>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-dim">{it.label}</span>
              <span className="font-mono text-ink">
                🪙{formatCoins(it.value)}
              </span>
            </div>
            <div className="h-2 rounded-pill bg-surface-2">
              <div
                className="h-full rounded-pill"
                style={{
                  width: `${max > 0 ? (it.value / max) * 100 : 0}%`,
                  background: it.accent,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const HEAT = [
  "var(--color-surface-2)",
  "#1f3a1a",
  "#3f7a1f",
  "#7fbf26",
  "#c2ff48",
];

export function Heatmap({
  weeks,
}: {
  weeks: { date: string; amount: number; level: number; future: boolean }[][];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {weeks.map((wk, i) => (
          <div key={i} className="flex flex-1 flex-col gap-1">
            {wk.map((d, j) => (
              <div
                key={j}
                title={`${d.date}: 🪙${formatCoins(d.amount)}`}
                className="aspect-square rounded-[3px]"
                style={{ background: d.future ? "transparent" : HEAT[d.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 font-mono text-[10px] text-ink-dim">
        less
        {HEAT.map((c, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-xs"
            style={{ background: c }}
          />
        ))}
        more
      </div>
    </div>
  );
}
