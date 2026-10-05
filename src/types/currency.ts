import type { CURRENCIES, RIAL_UNITS } from "@/constants/currency";

export type Currency = (typeof CURRENCIES)[number];

export type RialUnit = (typeof RIAL_UNITS)[number];

/** What amounts are shown and typed in: the book's currency, or rial / toman for an IRR book. */
export type MoneyUnit = RialUnit | Exclude<Currency, "IRR">;
