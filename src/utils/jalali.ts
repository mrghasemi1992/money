/*
 * Jalali (Solar Hijri) calendar math. Pure functions on ISO date strings ("2026-10-01").
 * Gregorian → Jalali uses Intl's persian calendar; Jalali → Gregorian, which Intl can't do,
 * uses the arithmetic algorithm from daily-transactions. Both agree for 1300–1500.
 * Names and formatting for both calendars are in utils/calendar.ts.
 */

import type { CalendarDate } from "@/types/calendar";

import { isoToParts, isoToUtcTime, partsToIso } from "./iso-date";
import { toLatinDigits } from "./number";

const DAY_MS = 86_400_000;

const persianCalendarParts = new Intl.DateTimeFormat(
  "en-US-u-ca-persian-nu-latn",
  { timeZone: "UTC", year: "numeric", month: "numeric", day: "numeric" },
);

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function gregorianToJalali(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  const parts = persianCalendarParts.formatToParts(
    new Date(Date.UTC(year, month - 1, day)),
  );
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Returns [year, month, day] in the Gregorian calendar. */
export function jalaliToGregorian({
  year,
  month,
  day,
}: CalendarDate): [number, number, number] {
  const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  const gregorianMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jy = year - 979;
  const jm = month - 1;
  const jd = day - 1;

  let jalaliDayNo =
    365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4);
  for (let i = 0; i < jm; i++) jalaliDayNo += jalaliMonthDays[i];
  jalaliDayNo += jd;

  let gregorianDayNo = jalaliDayNo + 79;
  let gy = 1600 + 400 * Math.floor(gregorianDayNo / 146097);
  gregorianDayNo %= 146097;

  let leap = true;
  if (gregorianDayNo >= 36525) {
    gregorianDayNo--;
    gy += 100 * Math.floor(gregorianDayNo / 36524);
    gregorianDayNo %= 36524;
    if (gregorianDayNo >= 365) gregorianDayNo++;
    else leap = false;
  }

  gy += 4 * Math.floor(gregorianDayNo / 1461);
  gregorianDayNo %= 1461;
  if (gregorianDayNo >= 366) {
    leap = false;
    gregorianDayNo--;
    gy += Math.floor(gregorianDayNo / 365);
    gregorianDayNo %= 365;
  }

  let gm = 0;
  const monthLength = (m: number) =>
    gregorianMonthDays[m] + (m === 1 && leap ? 1 : 0);
  while (gregorianDayNo >= monthLength(gm)) {
    gregorianDayNo -= monthLength(gm);
    gm++;
  }
  return [gy, gm + 1, gregorianDayNo + 1];
}

/** "2026-10-01" → { year: 1405, month: 7, day: 9 } */
export function isoToJalali(iso: string): CalendarDate {
  return gregorianToJalali(...isoToParts(iso));
}

/** { year: 1405, month: 7, day: 9 } → "2026-10-01" */
export function jalaliToIso(date: CalendarDate): string {
  return partsToIso(...jalaliToGregorian(date));
}

/** Esfand has 30 days in a leap year, 29 otherwise. */
export function isJalaliLeapYear(year: number): boolean {
  const esfandFirst = isoToUtcTime(jalaliToIso({ year, month: 12, day: 1 }));
  const nextNowruz = isoToUtcTime(
    jalaliToIso({ year: year + 1, month: 1, day: 1 }),
  );
  return (nextNowruz - esfandFirst) / DAY_MS === 30;
}

export function daysInJalaliMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

export function isValidJalaliDate({ year, month, day }: CalendarDate): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInJalaliMonth(year, month)
  );
}

/** { year: 1405, month: 7, day: 9 } → "1405/07/09", the MCP tools' Jalali date format. */
export function jalaliToString({ year, month, day }: CalendarDate): string {
  return `${year}/${pad2(month)}/${pad2(day)}`;
}

/**
 * Parses "1405/07/09", "1405-7-9" or the same with Persian digits.
 * Returns null when it isn't a real Jalali date.
 */
export function parseJalali(text: string): CalendarDate | null {
  const match = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/.exec(
    toLatinDigits(text.trim()),
  );
  if (!match) return null;
  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidJalaliDate(date) ? date : null;
}
