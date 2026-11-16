const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a bare YYYY-MM-DD string — the only form the site does arithmetic on. */
export function isIsoDate(value: string | undefined): value is string {
  return typeof value === "string" && ISO.test(value);
}

/** Parses YYYY-MM-DD as a UTC date so the day never shifts with the server's timezone. */
export function parseIsoDate(value: string): Date {
  const [, y, m, d] = ISO.exec(value) ?? [];
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

const LONG = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const MONTH_ONLY = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

/**
 * "2026-06-28" → "Jun 28, 2026". Anything that isn't an ISO date is shown as
 * written, so Studio can hold "Summer 2024" or "Ongoing" without a parser
 * fighting it.
 */
export function formatDate(value: string, style: "long" | "month" | "month-only" = "long"): string {
  if (!isIsoDate(value)) return value;
  const date = parseIsoDate(value);
  if (style === "month") return MONTH.format(date);
  if (style === "month-only") return MONTH_ONLY.format(date);
  return LONG.format(date);
}

/** Today as YYYY-MM-DD in UTC. Call it on the server so client and server agree. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Whether a role's end ("Present", "January 2025", "2019") falls within the
 * last `years` years of `today` (ISO). A role still running counts, and so
 * does an end that cannot be read, so nothing is hidden by mistake. A bare
 * year counts as that December; a month counts to its last day.
 */
export function endedWithinYears(end: string, years: number, today: string): boolean {
  const year = /\b(\d{4})\b/.exec(end);
  if (!year) return true;
  const month = /[A-Za-z]{3,}/.exec(end);
  const monthIndex = month ? new Date(`${month[0]} 1, 2000`).getMonth() : 11;
  const ended = new Date(Date.UTC(Number(year[1]), (Number.isNaN(monthIndex) ? 11 : monthIndex) + 1, 0));
  const now = parseIsoDate(today);
  const cutoff = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), now.getUTCDate()));
  return ended.getTime() >= cutoff.getTime();
}
