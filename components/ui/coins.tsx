import { formatCoins } from "@/lib/format";
import { PixelIcon } from "./pixel-icon";

// Coin glyph + formatted amount. Inherits font size/weight/color from its
// parent — style the parent exactly as before and pass an icon `size` to match.
export function Coins({
  amount,
  size = 16,
  className = "",
}: {
  amount: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap tabular-nums ${className}`}
    >
      <PixelIcon name="brand/coin" size={size} />
      {formatCoins(amount)}
    </span>
  );
}
