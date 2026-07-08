import { BCP47_TAG } from './index';
import type { Locale } from '../stores/locale-store';

/** ISO 4217 minor-unit exponents for the currencies this app supports.
 * Amounts are stored in Dexie as integers in these minor units. */
const CURRENCY_EXPONENT: Record<string, number> = {
  USD: 2,
  EUR: 2,
  IRR: 0,
};

/** Formats an integer minor-unit amount (cents/rials, as stored in Dexie)
 * as a localized currency string — the only correct source of Persian digit
 * characters (never produce them via a font feature). */
export function formatAmount(
  minorUnits: number,
  currency: string,
  locale: Locale,
): string {
  const exponent = CURRENCY_EXPONENT[currency] ?? 2;
  const amount = minorUnits / 10 ** exponent;
  return new Intl.NumberFormat(BCP47_TAG[locale], {
    style: 'currency',
    currency,
    signDisplay: 'never',
  }).format(amount);
}

/** Formats a plain number (no currency) with locale-appropriate digits and
 * grouping, e.g. for spacing/radius scale labels or counts. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(BCP47_TAG[locale]).format(value);
}
