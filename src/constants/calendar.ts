import type { CalendarSystem, Weekday } from "@/types/calendar";
import type { Locale } from "@/types/locale";

/** Calendars a user can pick. Dates are always stored as Gregorian ISO strings; this is display only. */
export const CALENDARS = ["jalali", "gregorian"] as const;

/** The calendar a new user gets for their language. Users can change it in settings. */
export const DEFAULT_CALENDAR: Record<Locale, CalendarSystem> = {
  fa: "jalali",
  en: "gregorian",
};

/**
 * Days of the week as JavaScript numbers them (Date#getUTCDay): 0 = Sunday … 6 = Saturday.
 * The Jalali week starts on Saturday with Friday as the weekend; the Gregorian one starts on
 * Monday with Saturday and Sunday as the weekend.
 */
export const WEEK_START: Record<CalendarSystem, Weekday> = {
  jalali: 6,
  gregorian: 1,
};

export const WEEKEND: Record<CalendarSystem, readonly Weekday[]> = {
  jalali: [5],
  gregorian: [6, 0],
};

/*
 * Month and weekday names, written out instead of taken from Intl so they are the same in every
 * browser and in Node, and Persian keeps its ZWNJ («پنج‌شنبه», not «پنجشنبه»).
 */

export const MONTH_NAMES: Record<
  CalendarSystem,
  Record<Locale, readonly string[]>
> = {
  jalali: {
    fa: [
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
    ],
    en: [
      "Farvardin",
      "Ordibehesht",
      "Khordad",
      "Tir",
      "Mordad",
      "Shahrivar",
      "Mehr",
      "Aban",
      "Azar",
      "Dey",
      "Bahman",
      "Esfand",
    ],
  },
  gregorian: {
    fa: [
      "ژانویه",
      "فوریه",
      "مارس",
      "آوریل",
      "مه",
      "ژوئن",
      "ژوئیه",
      "اوت",
      "سپتامبر",
      "اکتبر",
      "نوامبر",
      "دسامبر",
    ],
    en: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
};

/** Indexed by Weekday: 0 = Sunday … 6 = Saturday. */
export const WEEKDAY_NAMES: Record<Locale, readonly string[]> = {
  fa: ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"],
  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

/** One-letter (Persian) or two-letter (English) column heads for the month grid. */
export const WEEKDAY_SHORT_NAMES: Record<Locale, readonly string[]> = {
  fa: ["ی", "د", "س", "چ", "پ", "ج", "ش"],
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
};
