import type { Direction, Locale } from "@/types/locale";

/** The app's languages. Persian is the default and the language of the design. */
export const LOCALES = ["fa", "en"] as const;

export const DEFAULT_LOCALE: Locale = "fa";

/** Remembers the language of signed-out visitors (the login page), and the last one used on this device. */
export const LOCALE_COOKIE = "money-locale";

/** One year, in seconds. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_DIRECTIONS: Record<Locale, Direction> = {
  fa: "rtl",
  en: "ltr",
};

/** Each language's own name, the same in every interface language (for the language switch). */
export const LOCALE_NAMES: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

/**
 * BCP 47 tags for Intl. fa-IR gives Persian digits and the «٬» / «٫» separators; en-US gives
 * Latin digits with «,» / «.».
 */
export const INTL_LOCALES: Record<Locale, string> = {
  fa: "fa-IR",
  en: "en-US",
};
