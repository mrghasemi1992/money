/*
 * Dates in the user's calendar (Jalali or Gregorian) and language. Dates travel through the app
 * as Gregorian ISO strings; these functions only turn them into calendar parts and text for
 * display, and back.
 */

import {
  MONTH_NAMES,
  WEEK_START,
  WEEKDAY_NAMES,
  WEEKEND,
} from "@/constants/calendar";
import type {
  CalendarDate,
  CalendarSystem,
  DateFormat,
} from "@/types/calendar";
import type { Locale } from "@/types/locale";

import { isoToParts, isoWeekday, partsToIso } from "./iso-date";
import {
  daysInJalaliMonth,
  isoToJalali,
  isValidJalaliDate,
  jalaliToIso,
} from "./jalali";
import { toLocaleDigits } from "./number";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** "2026-10-01" → { year: 1405, month: 7, day: 9 } (Jalali) or { 2026, 10, 1 } (Gregorian). */
export function toCalendarDate(
  iso: string,
  calendar: CalendarSystem,
): CalendarDate {
  if (calendar === "jalali") return isoToJalali(iso);
  const [year, month, day] = isoToParts(iso);
  return { year, month, day };
}

/** The reverse of toCalendarDate. */
export function fromCalendarDate(
  date: CalendarDate,
  calendar: CalendarSystem,
): string {
  if (calendar === "jalali") return jalaliToIso(date);
  return partsToIso(date.year, date.month, date.day);
}

export function daysInMonth(
  calendar: CalendarSystem,
  year: number,
  month: number,
): number {
  if (calendar === "jalali") return daysInJalaliMonth(year, month);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidCalendarDate(
  date: CalendarDate,
  calendar: CalendarSystem,
): boolean {
  if (calendar === "jalali") return isValidJalaliDate(date);
  const { year, month, day } = date;
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth("gregorian", year, month)
  );
}

/** The year and month after (delta 1) or before (delta −1) the given month. Same for both calendars. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** The same day of the month `delta` months away, moved back to the month's last day if needed. */
export function addMonths(
  iso: string,
  delta: number,
  calendar: CalendarSystem,
): string {
  const { year, month, day } = toCalendarDate(iso, calendar);
  const next = shiftMonth(year, month, delta);
  return fromCalendarDate(
    {
      ...next,
      day: Math.min(day, daysInMonth(calendar, next.year, next.month)),
    },
    calendar,
  );
}

/** First and last ISO date of a month, for queries ("this month", budgets, monthly reports). */
export function monthRange(
  calendar: CalendarSystem,
  year: number,
  month: number,
): { start: string; end: string } {
  return {
    start: fromCalendarDate({ year, month, day: 1 }, calendar),
    end: fromCalendarDate(
      { year, month, day: daysInMonth(calendar, year, month) },
      calendar,
    ),
  };
}

/** Column of the date in a week that starts on the calendar's first day: 0 … 6. */
export function weekColumn(iso: string, calendar: CalendarSystem): number {
  return (isoWeekday(iso) - WEEK_START[calendar] + 7) % 7;
}

export function isWeekend(iso: string, calendar: CalendarSystem): boolean {
  return (WEEKEND[calendar] as readonly number[]).includes(isoWeekday(iso));
}

export function monthName(
  calendar: CalendarSystem,
  locale: Locale,
  month: number,
): string {
  return MONTH_NAMES[calendar][locale][month - 1];
}

/** «مهر ۱۴۰۵», «اکتبر ۲۰۲۶», «Mehr 1405», «October 2026». */
export function formatMonth(
  calendar: CalendarSystem,
  locale: Locale,
  year: number,
  month: number,
): string {
  return `${monthName(calendar, locale, month)} ${toLocaleDigits(year, locale)}`;
}

/**
 * Formats an ISO date in the user's calendar and language.
 *
 * | format  | fa, Jalali              | en, Jalali              | en, Gregorian              |
 * |---------|-------------------------|-------------------------|----------------------------|
 * | long    | ۹ مهر ۱۴۰۵              | 9 Mehr 1405             | 1 October 2026             |
 * | weekday | پنج‌شنبه ۹ مهر ۱۴۰۵      | Thursday, 9 Mehr 1405   | Thursday, 1 October 2026   |
 * | short   | ۹ مهر                   | 9 Mehr                  | 1 Oct                      |
 * | month   | مهر ۱۴۰۵                | Mehr 1405               | October 2026               |
 * | numeric | ۱۴۰۵/۰۷/۰۹              | 1405/07/09              | 2026/10/01                 |
 *
 * Persian with the Gregorian calendar reads «۱ اکتبر ۲۰۲۶». Numeric is for dense tables only.
 */
export function formatDate(
  iso: string,
  {
    locale,
    calendar,
    format = "long",
  }: { locale: Locale; calendar: CalendarSystem; format?: DateFormat },
): string {
  const { year, month, day } = toCalendarDate(iso, calendar);
  const digits = (value: string | number) => toLocaleDigits(value, locale);
  const name = monthName(calendar, locale, month);
  const dayAndMonth = `${digits(day)} ${name}`;
  switch (format) {
    case "numeric":
      return digits(`${year}/${pad2(month)}/${pad2(day)}`);
    case "short":
      // English Gregorian months have common three-letter forms; Jalali months don't.
      return locale === "en" && calendar === "gregorian"
        ? `${digits(day)} ${name.slice(0, 3)}`
        : dayAndMonth;
    case "month":
      return formatMonth(calendar, locale, year, month);
    case "weekday": {
      const weekday = WEEKDAY_NAMES[locale][isoWeekday(iso)];
      const separator = locale === "en" ? ", " : " ";
      return `${weekday}${separator}${dayAndMonth} ${digits(year)}`;
    }
    case "long":
      return `${dayAndMonth} ${digits(year)}`;
  }
}
