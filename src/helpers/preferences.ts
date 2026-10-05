import { DEFAULT_CALENDAR, CALENDARS } from "@/constants/calendar";
import { DEFAULT_RIAL_UNIT, RIAL_UNITS } from "@/constants/currency";
import { DEFAULT_LOCALE } from "@/constants/locale";
import type { BookSettings } from "@/types/book";
import type { CalendarSystem } from "@/types/calendar";
import type { RialUnit } from "@/types/currency";
import type { Locale } from "@/types/locale";
import type { Preferences, UserPreferences } from "@/types/preferences";
import { isLocale } from "@/utils/locale";

import { getMoneyUnit } from "./money";

/*
 * Better Auth types the preference fields on the user as plain strings. These read them back
 * into Money's types; anything unexpected falls back to the default.
 */

export function toLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function toCalendar(
  value: string | null | undefined,
  locale: Locale,
): CalendarSystem {
  return (
    CALENDARS.find((calendar) => calendar === value) ?? DEFAULT_CALENDAR[locale]
  );
}

export function toRialUnit(value: string | null | undefined): RialUnit {
  return RIAL_UNITS.find((unit) => unit === value) ?? DEFAULT_RIAL_UNIT;
}

/** The preferences stored on a user record. */
export function toUserPreferences(user: {
  locale?: string | null;
  calendar?: string | null;
  rialUnit?: string | null;
}): UserPreferences {
  const locale = toLocale(user.locale);
  return {
    locale,
    calendar: toCalendar(user.calendar, locale),
    rialUnit: toRialUnit(user.rialUnit),
  };
}

/** Everything that decides how amounts and dates look for one viewer of the book. */
export function combinePreferences(
  user: UserPreferences,
  book: BookSettings,
  timeZone: string,
): Preferences {
  return {
    ...user,
    currency: book.currency,
    timeZone,
    moneyUnit: getMoneyUnit(book.currency, user.rialUnit),
  };
}
