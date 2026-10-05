import type { CALENDARS } from "@/constants/calendar";

export type CalendarSystem = (typeof CALENDARS)[number];

/** A date in one calendar. Months are 1–12. */
export type CalendarDate = { year: number; month: number; day: number };

/** Day of the week as Date#getUTCDay numbers it: 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * How a date reads (Jalali / Gregorian, Persian):
 * long «۹ مهر ۱۴۰۵» / «۱ اکتبر ۲۰۲۶», weekday «پنج‌شنبه ۹ مهر ۱۴۰۵», short «۹ مهر»,
 * month «مهر ۱۴۰۵», numeric «۱۴۰۵/۰۷/۰۹» (dense tables only). English: «9 Mehr 1405»,
 * «Thursday, 1 October 2026», «1 Oct»… see formatDate.
 */
export type DateFormat = "long" | "weekday" | "short" | "month" | "numeric";
