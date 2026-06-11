"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#0a0913",
          color: "#f3f1ff",
          fontFamily: "system-ui",
          margin: 0,
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pixel/brand/coin.png"
            alt=""
            width={48}
            height={48}
            style={{ imageRendering: "pixelated" }}
          />
          <p>The app crashed. Reload to try again.</p>
          <button
            onClick={reset}
            style={{
              background: "#2ee6ff",
              color: "#0a0913",
              border: "none",
              borderRadius: 999,
              padding: "10px 22px",
              fontWeight: 700,
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
