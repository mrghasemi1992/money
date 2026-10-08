import { MINOR_UNITS_PER_MAJOR } from "@/constants/currency";
import type { CalendarSystem } from "@/types/calendar";
import type { Currency } from "@/types/currency";
import {
  fromCalendarDate,
  isValidCalendarDate,
  toCalendarDate,
} from "@/utils/calendar";
import { toLatinDigits } from "@/utils/number";

/*
 * The Claude connector's boundary. Claude reads and writes dates in the user's calendar and
 * amounts in the book currency's main unit (rials, dollars, …); the database keeps Gregorian
 * ISO dates and integers in the smallest unit (rials, cents). These convert between the two.
 */

/** How the connector writes a date of each calendar: Jalali 1405/07/16, Gregorian 2026-10-08. */
export const CONNECTOR_DATE_FORMATS: Record<CalendarSystem, string> = {
  jalali: "YYYY/MM/DD",
  gregorian: "YYYY-MM-DD",
};

const DATE = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;

/** Years below this are Jalali, from it on Gregorian (as in the transactions URL). */
const GREGORIAN_YEAR_MIN = 1700;

/** "2026-10-08" → "1405/07/16" (Jalali) or "2026-10-08" (Gregorian). */
export function formatConnectorDate(
  iso: string,
  calendar: CalendarSystem,
): string {
  const { year, month, day } = toCalendarDate(iso, calendar);
  const pad = (value: number) => String(value).padStart(2, "0");
  const separator = calendar === "jalali" ? "/" : "-";
  return [String(year).padStart(4, "0"), pad(month), pad(day)].join(separator);
}

/**
 * A date Claude sent, as a Gregorian ISO date, or null when it isn't a real date. The year
 * says the calendar, whatever the user's own is: «1405/07/16» is Jalali, «2026-10-08»
 * Gregorian (either separator). So a Jalali date copied from a bank SMS works for a user of
 * either calendar, and Claude never has to convert between calendars. Persian and Arabic
 * digits are accepted.
 */
export function parseConnectorDate(value: string): string | null {
  const match = DATE.exec(toLatinDigits(value.trim()));
  if (!match) return null;
  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const calendar: CalendarSystem =
    date.year >= GREGORIAN_YEAR_MIN ? "gregorian" : "jalali";
  if (!isValidCalendarDate(date, calendar)) return null;
  return fromCalendarDate(date, calendar);
}

/**
 * An amount Claude sent in the book currency's main unit (rials; dollars, euros or pounds
 * with up to two decimals) as an integer in the smallest unit, or null when it isn't a
 * positive amount the currency can hold.
 */
export function toMinorUnits(
  amount: number,
  currency: Currency,
): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const minor = amount * MINOR_UNITS_PER_MAJOR[currency];
  const rounded = Math.round(minor);
  // 12.345 dollars has a fraction of a cent; floating point noise (0.1 * 100) doesn't.
  if (Math.abs(minor - rounded) > 1e-6 * Math.max(1, Math.abs(minor)))
    return null;
  if (rounded <= 0 || !Number.isSafeInteger(rounded)) return null;
  return rounded;
}

/** A stored amount (smallest unit) in the book currency's main unit: 123456 cents → 1234.56. */
export function fromMinorUnits(minor: number, currency: Currency): number {
  return minor / MINOR_UNITS_PER_MAJOR[currency];
}
