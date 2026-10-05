import type { CalendarSystem } from "./calendar";
import type { Currency, MoneyUnit, RialUnit } from "./currency";
import type { Locale } from "./locale";

/** One user's display settings, stored on their user record. */
export type UserPreferences = {
  locale: Locale;
  calendar: CalendarSystem;
  /** Only matters when the book's currency is IRR. */
  rialUnit: RialUnit;
};

/**
 * Everything that decides how amounts and dates look for the current viewer: their own
 * preferences, the book's currency and their device's time zone.
 */
export type Preferences = UserPreferences & {
  currency: Currency;
  /** IANA time zone of the viewer's device (OS setting); decides what «today» is. */
  timeZone: string;
  /** Derived from currency and rialUnit. */
  moneyUnit: MoneyUnit;
};
