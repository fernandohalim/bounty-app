import { type CSSProperties } from "react";

// Renders /public/pixel/<name>.png crisply. `name` is the path under /pixel
// without extension, e.g. "categories/food", "brand/coin", "avatars/rookie_fox".
export function PixelIcon({
  name,
  size = 24,
  alt = "",
  className = "",
  style,
}: {
  name: string;
  size?: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/pixel/${name}.png`}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block shrink-0 select-none ${className}`}
      style={{ imageRendering: "pixelated", ...style }}
    />
  );
}
