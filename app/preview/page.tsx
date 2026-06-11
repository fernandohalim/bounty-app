// app/preview/page.tsx
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const COL = {
  void: "#0a0913",
  line: "#2c2740",
  ink: "#f3f1ff",
  dim: "#9b96bd",
  cyan: "#2ee6ff",
  pink: "#ff2d95",
  lime: "#c2ff48",
  violet: "#9d5cff",
  gold: "#ffcf3a",
};

const COIN_SRC = "/pixel/brand/coin.png";

/* ── tiny canvas helpers (module scope) ───────────────────────────── */

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, v: string) {
  (ctx as unknown as { letterSpacing: string }).letterSpacing = v;
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function radial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, alpha));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function grid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  alpha: number,
) {
  ctx.save();
  ctx.strokeStyle = hexA(COL.line, alpha);
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = r * 3;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 2);
  ctx.lineTo(x + r * 0.5, y - r * 0.5);
  ctx.lineTo(x + r * 2, y);
  ctx.lineTo(x + r * 0.5, y + r * 0.5);
  ctx.lineTo(x, y + r * 2);
  ctx.lineTo(x - r * 0.5, y + r * 0.5);
  ctx.lineTo(x - r * 2, y);
  ctx.lineTo(x - r * 0.5, y - r * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  size: number,
  glow: string,
  blur: number,
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false; // keep the pixel art crisp
  ctx.shadowColor = glow;
  ctx.shadowBlur = blur;
  ctx.drawImage(
    img,
    Math.round(cx - size / 2),
    Math.round(cy - size / 2),
    size,
    size,
  );
  ctx.restore();
}

function neonText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  fill: string,
  glow1: string,
  glow2: string,
) {
  ctx.save();
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = fill;
  ctx.shadowColor = glow2;
  ctx.shadowBlur = 55;
  ctx.fillText(text, x, y);
  ctx.shadowColor = glow1;
  ctx.shadowBlur = 26;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function pill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
) {
  ctx.save();
  ctx.font = "600 18px 'Martian Mono', monospace";
  ctx.textBaseline = "middle";
  const padX = 18;
  const h = 38;
  const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = hexA(color, 0.12);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  ctx.restore();
  return w;
}

/* ── the square badge (icon-192 + apple-touch-180) ────────────────── */

function drawBadge(
  ctx: CanvasRenderingContext2D,
  S: number,
  coin: HTMLImageElement,
) {
  ctx.clearRect(0, 0, S, S);
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#14111f");
  g.addColorStop(1, COL.void);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  radial(ctx, S * 0.85, 0, S * 0.95, COL.violet, 0.3);
  radial(ctx, 0, S, S * 0.95, COL.cyan, 0.24);
  grid(ctx, S, S, Math.round(S / 12), 0.05);

  const cs = Math.max(64, Math.round((S * 0.66) / 64) * 64); // 192/180→128, 512→320
  drawCoin(ctx, coin, S / 2, S / 2, cs, COL.cyan, S * 0.16);
}

/* ── the OG poster (1200 × 630) ───────────────────────────────────── */

function drawOG(ctx: CanvasRenderingContext2D, coin: HTMLImageElement) {
  const W = 1200;
  const H = 630;

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0c0a16");
  g.addColorStop(1, "#070611");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  radial(ctx, W * 0.86, -60, 720, COL.violet, 0.34);
  radial(ctx, -80, H + 60, 680, COL.cyan, 0.26);
  radial(ctx, W * 0.62, H * 0.5, 520, COL.pink, 0.1);

  // synthwave floor grid
  const hz = H * 0.7;
  const vp = W * 0.5;
  ctx.save();
  ctx.strokeStyle = hexA(COL.violet, 0.5);
  ctx.lineWidth = 2;
  ctx.shadowColor = COL.violet;
  ctx.shadowBlur = 8;
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(vp + i * (W * 0.012), hz);
    ctx.lineTo(vp + i * (W * 0.12), H);
    ctx.stroke();
  }
  for (let j = 1; j <= 10; j++) {
    const t = j / 10;
    const y = hz + (H - hz) * Math.pow(t, 2.3);
    ctx.globalAlpha = 0.5 * (1 - t * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();
  // horizon glow line
  ctx.save();
  ctx.strokeStyle = hexA(COL.cyan, 0.85);
  ctx.lineWidth = 2;
  ctx.shadowColor = COL.cyan;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(0, hz);
  ctx.lineTo(W, hz);
  ctx.stroke();
  ctx.restore();

  // hero coin
  drawCoin(ctx, coin, 940, 315, 320, COL.cyan, 70);
  // wordmark
  neonText(
    ctx,
    "BOUNTY",
    70,
    340,
    "700 156px 'Pixelify Sans', system-ui",
    COL.ink,
    COL.cyan,
    COL.pink,
  );

  // pills
  let px = 74;
  const py = 388;
  px += pill(ctx, px, py, "track spending", COL.cyan) + 14;
  px += pill(ctx, px, py, "form crews", COL.violet) + 14;
  pill(ctx, px, py, "level up", COL.lime);

  // CRT scanlines + frame
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = hexA(COL.line, 0.9);
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.restore();
}

/* ── download helper ──────────────────────────────────────────────── */

function download(ref: RefObject<HTMLCanvasElement | null>, name: string) {
  const c = ref.current;
  if (!c) return;
  c.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

/* ── page ─────────────────────────────────────────────────────────── */

export default function PreviewPage() {
  const iconRef = useRef<HTMLCanvasElement>(null);
  const icon512Ref = useRef<HTMLCanvasElement>(null);
  const appleRef = useRef<HTMLCanvasElement>(null);
  const ogRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          document.fonts.load("700 156px 'Pixelify Sans'"),
          document.fonts.load("700 24px 'Pixelify Sans'"),
          document.fonts.load("600 18px 'Martian Mono'"),
          document.fonts.load("400 27px 'Martian Mono'"),
        ]);
      } catch {
        /* fall back to system fonts if Google Fonts are blocked */
      }
      const coin = await loadImage(COIN_SRC);
      if (cancelled) return;
      if (iconRef.current)
        drawBadge(iconRef.current.getContext("2d")!, 192, coin);
      if (appleRef.current)
        drawBadge(appleRef.current.getContext("2d")!, 180, coin);
      if (ogRef.current) drawOG(ogRef.current.getContext("2d")!, coin);
      if (icon512Ref.current)
        drawBadge(icon512Ref.current.getContext("2d")!, 512, coin);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const btn =
    "rounded-pill bg-neon-cyan px-4 py-2 font-mono text-xs font-bold text-void shadow-glow-cyan transition active:scale-95 disabled:opacity-50";

  return (
    <>
      {/* Canonical fonts so the canvas wordmark matches the app */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Martian+Mono:wght@400;600;700&display=swap"
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-10">
        <header className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
            Brand kit
          </span>
          <h1 className="text-neon font-display text-4xl font-bold">
            Preview &amp; export
          </h1>
          <p className="font-mono text-xs text-ink-dim">
            Rendered at true pixel size. Download, then drop into{" "}
            <span className="text-neon-cyan">/public</span>.
          </p>
        </header>

        {/* OG */}
        <section className="surface-card flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Open Graph
              </h2>
              <p className="font-mono text-[11px] text-ink-dim">
                1200 × 630 · /og.png
              </p>
            </div>
            <button
              className={btn}
              disabled={!ready}
              onClick={() => download(ogRef, "og.png")}
            >
              {ready ? "download png" : "rendering…"}
            </button>
          </div>
          <div className="overflow-hidden rounded-card border border-line">
            <canvas
              ref={ogRef}
              width={1200}
              height={630}
              className="block h-auto w-full"
            />
          </div>
        </section>

        {/* icons */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <section className="surface-card flex flex-col items-center gap-4 p-5">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  App icon
                </h2>
                <p className="font-mono text-[11px] text-ink-dim">
                  192 × 192 · /icon-192.png
                </p>
              </div>
              <button
                className={btn}
                disabled={!ready}
                onClick={() => download(iconRef, "icon-192.png")}
              >
                png
              </button>
            </div>
            <canvas
              ref={iconRef}
              width={192}
              height={192}
              className="rounded-card border border-line"
              style={{ width: 168, height: 168 }}
            />
            <p className="font-mono text-[10px] text-ink-dim">
              maskable · safe zone respected
            </p>
          </section>

          <section className="surface-card flex flex-col items-center gap-4 p-5">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Apple touch
                </h2>
                <p className="font-mono text-[11px] text-ink-dim">
                  180 × 180 · /apple-touch-icon.png
                </p>
              </div>
              <button
                className={btn}
                disabled={!ready}
                onClick={() => download(appleRef, "apple-touch-icon.png")}
              >
                png
              </button>
            </div>
            <canvas
              ref={appleRef}
              width={180}
              height={180}
              className="rounded-card border border-line"
              style={{ width: 168, height: 168 }}
            />
            <p className="font-mono text-[10px] text-ink-dim">
              opaque · iOS rounds the corners
            </p>
          </section>

          <section className="surface-card flex flex-col items-center gap-4 p-5">
            <div className="flex w-full items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  PWA icon
                </h2>
                <p className="font-mono text-[11px] text-ink-dim">
                  512 × 512 · /icon-512.png
                </p>
              </div>
              <button
                className={btn}
                disabled={!ready}
                onClick={() => download(icon512Ref, "icon-512.png")}
              >
                png
              </button>
            </div>
            <canvas
              ref={icon512Ref}
              width={512}
              height={512}
              className="rounded-card border border-line"
              style={{ width: 168, height: 168 }}
            />
            <p className="font-mono text-[10px] text-ink-dim">
              maskable · home-screen / splash
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
