"use client";

import { createContext, useContext } from "react";

import { DEFAULT_BOOK_SETTINGS } from "@/constants/book";
import { DEFAULT_CALENDAR } from "@/constants/calendar";
import { DEFAULT_RIAL_UNIT } from "@/constants/currency";
import { DEFAULT_LOCALE } from "@/constants/locale";
import { DEFAULT_TIME_ZONE } from "@/constants/time-zone";
import { combinePreferences } from "@/helpers/preferences";
import type { Preferences } from "@/types/preferences";

/** Filled by Providers from the server's getPreferences(). */
export const PreferencesContext = createContext<Preferences>(
  combinePreferences(
    {
      locale: DEFAULT_LOCALE,
      calendar: DEFAULT_CALENDAR[DEFAULT_LOCALE],
      rialUnit: DEFAULT_RIAL_UNIT,
    },
    DEFAULT_BOOK_SETTINGS,
    DEFAULT_TIME_ZONE,
  ),
);

/**
 * The viewer's language, calendar, money unit and device time zone, and the book's currency.
 * For client components; Server Components call getPreferences() from src/i18n.
 */
export function usePreferences(): Preferences {
  return useContext(PreferencesContext);
}
