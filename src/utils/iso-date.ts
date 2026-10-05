/*
 * Helpers for ISO date strings ("2026-10-01"), the form dates travel in through the app.
 * Calendar-neutral: Jalali and Gregorian display live in utils/calendar.ts.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Milliseconds since the epoch at midnight UTC of the date. */
export function isoToUtcTime(iso: string): number {
  const match = ISO_DATE.exec(iso);
  if (!match) throw new RangeError(`Not an ISO date: ${iso}`);
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function utcTimeToIso(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

/** True for a real calendar date written as YYYY-MM-DD. */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  return utcTimeToIso(isoToUtcTime(value)) === value;
}

/** "2026-10-01" → [2026, 10, 1] */
export function isoToParts(iso: string): [number, number, number] {
  const date = new Date(isoToUtcTime(iso));
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
}

/** (2026, 10, 1) → "2026-10-01" */
export function partsToIso(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;
}

/** Day of the week, 0 = Sunday … 6 = Saturday. */
export function isoWeekday(iso: string): number {
  return new Date(isoToUtcTime(iso)).getUTCDay();
}

export function addDays(iso: string, days: number): string {
  return utcTimeToIso(isoToUtcTime(iso) + days * DAY_MS);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((isoToUtcTime(to) - isoToUtcTime(from)) / DAY_MS);
}

/** Today's date as ISO in the given IANA time zone (the viewer's device time zone). */
export function todayIso(timeZone: string, now = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The device's time zone as the OS reports it ("Europe/London"). Browser and Node. */
export function systemTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** True when Intl knows the IANA time zone name ("Asia/Tehran", "Europe/London"). */
export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
