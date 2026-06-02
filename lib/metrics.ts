export function localDate(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekStart(ymd: string): string {
  const dow = new Date(ymd + "T00:00:00Z").getUTCDay(); // 0 Sun … 6 Sat
  return addDays(ymd, -((dow + 6) % 7)); // back to Monday
}

export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function todayLocal(tz: string): string {
  return localDate(new Date().toISOString(), tz);
}

export function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}