export const formatCoins = (n: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(n));