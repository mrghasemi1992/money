/*
 * Jalali (Solar Hijri) calendar helpers. Pure functions on ISO date strings ("2026-10-01").
 * Gregorian → Jalali uses Intl's persian calendar; Jalali → Gregorian, which Intl can't do,
 * uses the arithmetic algorithm from daily-transactions. Both agree for 1300–1500.
 */

import { toLatinDigits, toPersianDigits } from "./number";

export type JalaliDate = { year: number; month: number; day: number };

export type JalaliFormat = "long" | "weekday" | "short" | "month" | "numeric";

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** Weekday names, starting on Saturday (شنبه) like the Persian week. */
export const JALALI_WEEKDAYS = [
  "شنبه",
  "یک‌شنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
] as const;

export const JALALI_WEEKDAYS_SHORT = [
  "ش",
  "ی",
  "د",
  "س",
  "چ",
  "پ",
  "ج",
] as const;

/** Index of Friday (جمعه), the weekend, in the Saturday-first week. */
export const FRIDAY_INDEX = 6;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

const persianCalendarParts = new Intl.DateTimeFormat(
  "en-US-u-ca-persian-nu-latn",
  { timeZone: "UTC", year: "numeric", month: "numeric", day: "numeric" },
);

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function isoToUtcTime(iso: string): number {
  const match = ISO_DATE.exec(iso);
  if (!match) throw new RangeError(`Not an ISO date: ${iso}`);
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function utcTimeToIso(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

/** True for a real calendar date written as YYYY-MM-DD. */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  return utcTimeToIso(isoToUtcTime(value)) === value;
}

export function gregorianToJalali(
  year: number,
  month: number,
  day: number,
): JalaliDate {
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
}: JalaliDate): [number, number, number] {
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
export function isoToJalali(iso: string): JalaliDate {
  const date = new Date(isoToUtcTime(iso));
  return gregorianToJalali(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

/** { year: 1405, month: 7, day: 9 } → "2026-10-01" */
export function jalaliToIso(date: JalaliDate): string {
  const [year, month, day] = jalaliToGregorian(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
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

export function isValidJalaliDate({ year, month, day }: JalaliDate): boolean {
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

/** Day of the week, 0 = Saturday (شنبه) … 6 = Friday (جمعه). */
export function weekdayIndex(iso: string): number {
  return (new Date(isoToUtcTime(iso)).getUTCDay() + 1) % 7;
}

export function addDays(iso: string, days: number): string {
  return utcTimeToIso(isoToUtcTime(iso) + days * DAY_MS);
}

/** The year and month after (delta 1) or before (delta −1) the given Jalali month. */
export function shiftJalaliMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Today's date as ISO in the given time zone. The app uses Asia/Tehran. */
export function todayIso(timeZone = "Asia/Tehran", now = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Formats an ISO date in Jalali with Persian digits:
 * long «۹ مهر ۱۴۰۵», weekday «پنج‌شنبه ۹ مهر ۱۴۰۵», short «۹ مهر», month «مهر ۱۴۰۵»,
 * numeric «۱۴۰۵/۰۷/۰۹» (dense tables only).
 */
export function formatJalali(
  iso: string,
  format: JalaliFormat = "long",
): string {
  const { year, month, day } = isoToJalali(iso);
  const monthName = JALALI_MONTHS[month - 1];
  switch (format) {
    case "numeric":
      return toPersianDigits(`${year}/${pad2(month)}/${pad2(day)}`);
    case "short":
      return `${toPersianDigits(day)} ${monthName}`;
    case "month":
      return `${monthName} ${toPersianDigits(year)}`;
    case "weekday":
      return `${JALALI_WEEKDAYS[weekdayIndex(iso)]} ${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`;
    case "long":
      return `${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`;
  }
}

/** { year: 1405, month: 7, day: 9 } → "1405/07/09", the MCP tools' date format. */
export function jalaliToString({ year, month, day }: JalaliDate): string {
  return `${year}/${pad2(month)}/${pad2(day)}`;
}

/**
 * Parses "1405/07/09", "1405-7-9" or the same with Persian digits.
 * Returns null when it isn't a real Jalali date.
 */
export function parseJalali(text: string): JalaliDate | null {
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
