export function levelInfo(xp: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
  const curFloor = 100 * (level - 1) ** 2;
  const nextFloor = 100 * level ** 2;
  const span = nextFloor - curFloor;
  return { level, curFloor, nextFloor, into: xp - curFloor, span, pct: span > 0 ? ((xp - curFloor) / span) * 100 : 0 };
}