"use client";

import { useState } from "react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const pad = (n: number) => String(n).padStart(2, "0");

export function DateTimePicker({
  value,
  onChange,
  mode = "datetime",
  label = "When",
}: {
  value: Date;
  onChange: (d: Date) => void;
  mode?: "date" | "datetime";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => new Date(value));

  const summary =
    value.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    (mode === "datetime"
      ? ` · ${pad(value.getHours())}:${pad(value.getMinutes())}`
      : "");

  const y = view.getFullYear();
  const mo = view.getMonth();
  const startPad = (new Date(y, mo, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const sameDay = (d: number) =>
    value.getFullYear() === y &&
    value.getMonth() === mo &&
    value.getDate() === d;

  const now = new Date();
  const isToday = (d: number) =>
    now.getFullYear() === y && now.getMonth() === mo && now.getDate() === d;

  function pickDay(d: number) {
    const next = new Date(value);
    next.setFullYear(y, mo, d);
    onChange(next);
    if (mode === "date") setOpen(false);
  }
  function bumpTime(unit: "h" | "m", n: number) {
    const next = new Date(value);
    if (unit === "h") next.setHours((next.getHours() + n + 24) % 24);
    else next.setMinutes((next.getMinutes() + n + 60) % 60);
    onChange(next);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!open) setView(new Date(value));
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between rounded-pill border border-line bg-surface px-4 py-2.5 text-sm"
      >
        <span className="text-ink-dim">{label}</span>
        <span className="font-mono text-neon-cyan">{summary} 📅</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-void/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs rounded-card border border-line bg-surface-2 p-4 shadow-glow-cyan">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView(new Date(y, mo - 1, 1))}
                className="h-7 w-7 rounded-full bg-surface text-ink-dim active:scale-90"
              >
                ‹
              </button>
              <span className="font-display text-sm font-bold text-ink">
                {MONTHS[mo]} {y}
              </span>
              <button
                type="button"
                onClick={() => setView(new Date(y, mo + 1, 1))}
                className="h-7 w-7 rounded-full bg-surface text-ink-dim active:scale-90"
              >
                ›
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-ink-dim">
              {DOW.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) =>
                d === null ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pickDay(d)}
                    className={`aspect-square rounded-lg text-sm transition ${
                      sameDay(d)
                        ? "bg-neon-cyan font-bold text-void"
                        : isToday(d)
                          ? "text-neon-cyan ring-1 ring-neon-cyan/50"
                          : "text-ink active:bg-surface"
                    }`}
                  >
                    {d}
                  </button>
                ),
              )}
            </div>

            {mode === "datetime" && (
              <div className="mt-3 flex items-center justify-center gap-3 border-t border-line pt-3">
                <TimeCol
                  value={pad(value.getHours())}
                  onUp={() => bumpTime("h", 1)}
                  onDown={() => bumpTime("h", -1)}
                />
                <span className="font-mono text-xl text-ink-dim">:</span>
                <TimeCol
                  value={pad(value.getMinutes())}
                  onUp={() => bumpTime("m", 1)}
                  onDown={() => bumpTime("m", -1)}
                />
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const n = new Date();
                  onChange(n);
                  setView(n);
                }}
                className="flex-1 rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-neon-cyan active:scale-95"
              >
                {mode === "datetime" ? "now" : "today"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-pill border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-neon-cyan active:scale-95"
              >
                done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeCol({
  value,
  onUp,
  onDown,
}: {
  value: string;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onUp}
        className="text-ink-dim active:scale-90"
      >
        ▲
      </button>
      <span className="font-mono text-2xl font-bold text-neon-lime">
        {value}
      </span>
      <button
        type="button"
        onClick={onDown}
        className="text-ink-dim active:scale-90"
      >
        ▼
      </button>
    </div>
  );
}
