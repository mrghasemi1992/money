import "server-only";

import { cache } from "react";

import { getSession } from "@/auth/session";
import { DEFAULT_BOOK_SETTINGS } from "@/constants/book";
import { DEFAULT_CALENDAR } from "@/constants/calendar";
import { DEFAULT_RIAL_UNIT } from "@/constants/currency";
import { getBookSettings } from "@/db/book";
import { combinePreferences, toUserPreferences } from "@/helpers/preferences";
import type { Preferences } from "@/types/preferences";

import { resolveLocale } from "./locale";
import { resolveTimeZone } from "./time-zone";

/**
 * How amounts and dates look for this request: the signed-in user's language, calendar and
 * rial/toman choice, the book's currency and the device's time zone. Signed-out visitors get
 * the defaults for their language. Read once per request.
 */
export const getPreferences = cache(async (): Promise<Preferences> => {
  const session = await getSession();
  const timeZone = await resolveTimeZone();
  if (!session) {
    const locale = await resolveLocale();
    return combinePreferences(
      {
        locale,
        calendar: DEFAULT_CALENDAR[locale],
        rialUnit: DEFAULT_RIAL_UNIT,
      },
      DEFAULT_BOOK_SETTINGS,
      timeZone,
    );
  }
  return combinePreferences(
    toUserPreferences(session.user),
    await getBookSettings(),
    timeZone,
  );
});
