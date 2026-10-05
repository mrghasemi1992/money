import type { Currency, MoneyUnit, RialUnit } from "@/types/currency";
import type { Locale } from "@/types/locale";

/** Currencies a book can keep its amounts in. Stored in `book.currency`. */
export const CURRENCIES = ["IRR", "USD", "EUR", "GBP"] as const;

export const DEFAULT_CURRENCY: Currency = "IRR";

/** How a user sees and types amounts of an IRR book. One toman is ten rials. */
export const RIAL_UNITS = ["rial", "toman"] as const;

export const DEFAULT_RIAL_UNIT: RialUnit = "rial";

/**
 * Amounts are stored as integers in the currency's smallest unit: rials for IRR, cents and
 * pence for the others.
 */
export const MINOR_UNITS_PER_MAJOR: Record<Currency, number> = {
  IRR: 1,
  USD: 100,
  EUR: 100,
  GBP: 100,
};

/**
 * What amounts are shown and typed in.
 * - `minorPerUnit`: stored units in one shown unit (a toman is 10 rials, a dollar 100 cents).
 *   Its power of ten is also the most decimals the unit can show.
 * - `minFractionDigits`: decimals always shown. Dollars, euros and pounds always show cents;
 *   tomans show a decimal only when the rials don't divide by ten.
 */
export const MONEY_UNITS: Record<
  MoneyUnit,
  { currency: Currency; minorPerUnit: number; minFractionDigits: number }
> = {
  rial: { currency: "IRR", minorPerUnit: 1, minFractionDigits: 0 },
  toman: { currency: "IRR", minorPerUnit: 10, minFractionDigits: 0 },
  USD: { currency: "USD", minorPerUnit: 100, minFractionDigits: 2 },
  EUR: { currency: "EUR", minorPerUnit: 100, minFractionDigits: 2 },
  GBP: { currency: "GBP", minorPerUnit: 100, minFractionDigits: 2 },
};

/**
 * The unit's mark next to a number. English writes the currency symbol before the number
 * («$1,234.56»); Persian writes the unit's name after it («۱٬۲۳۴٫۵۶ دلار»).
 */
export const MONEY_UNIT_SYMBOLS: Record<
  Locale,
  Record<MoneyUnit, { text: string; position: "prefix" | "suffix" }>
> = {
  fa: {
    rial: { text: "ریال", position: "suffix" },
    toman: { text: "تومان", position: "suffix" },
    USD: { text: "دلار", position: "suffix" },
    EUR: { text: "یورو", position: "suffix" },
    GBP: { text: "پوند", position: "suffix" },
  },
  en: {
    rial: { text: "rial", position: "suffix" },
    toman: { text: "toman", position: "suffix" },
    USD: { text: "$", position: "prefix" },
    EUR: { text: "€", position: "prefix" },
    GBP: { text: "£", position: "prefix" },
  },
};
