import { MONEY_UNIT_SYMBOLS, MONEY_UNITS } from "@/constants/currency";
import type { Currency, MoneyUnit, RialUnit } from "@/types/currency";
import type { Locale } from "@/types/locale";
import {
  MINUS_SIGN,
  decimalSeparator,
  formatNumber,
  parseDecimalInput,
  toLocaleDigits,
} from "@/utils/number";

/*
 * Amounts are integers in the book currency's smallest unit (rials, cents, pence). These
 * helpers turn them into what the viewer reads and types: rial or toman for an IRR book,
 * dollars, euros or pounds otherwise.
 */

/** The unit amounts are shown and typed in. */
export function getMoneyUnit(
  currency: Currency,
  rialUnit: RialUnit,
): MoneyUnit {
  return currency === "IRR" ? rialUnit : currency;
}

/** Most decimals the unit can show: 0 for rial, 1 for toman, 2 for dollars, euros and pounds. */
export function unitFractionDigits(unit: MoneyUnit): number {
  return Math.round(Math.log10(MONEY_UNITS[unit].minorPerUnit));
}

/** The unit's mark and where it goes: «ریال» after the number, «$» before it in English. */
export function getMoneySymbol(unit: MoneyUnit, locale: Locale) {
  return MONEY_UNIT_SYMBOLS[locale][unit];
}

/**
 * The size of an amount, without sign or unit: 25000000 rials → "۲٬۵۰۰٬۰۰۰" (rial) or
 * "۲۵۰٬۰۰۰" (toman); 123456 cents → "1,234.56".
 */
export function formatMoneyNumber(
  minor: number,
  unit: MoneyUnit,
  locale: Locale,
): string {
  const { minorPerUnit, minFractionDigits } = MONEY_UNITS[unit];
  return formatNumber(Math.abs(minor) / minorPerUnit, locale, {
    minFractionDigits,
    maxFractionDigits: unitFractionDigits(unit),
  });
}

export type MoneySign = "auto" | "plus" | "minus" | "none";

/**
 * An amount as plain text, for sentences, toasts and aria labels: «۲٬۵۰۰٬۰۰۰ ریال»,
 * «−$1,234.56», «+۱۲٬۰۰۰ تومان». `auto` writes «−» only for negative values. In the UI, the
 * Amount component is preferred: it isolates the number as a left-to-right run.
 */
export function formatMoney(
  minor: number,
  unit: MoneyUnit,
  locale: Locale,
  sign: MoneySign = "auto",
): string {
  const number = formatMoneyNumber(minor, unit, locale);
  const signText =
    sign === "plus"
      ? "+"
      : sign === "minus" || (sign === "auto" && minor < 0)
        ? MINUS_SIGN
        : "";
  const symbol = getMoneySymbol(unit, locale);
  return symbol.position === "prefix"
    ? `${signText}${symbol.text}${number}`
    : `${signText}${number} ${symbol.text}`;
}

/**
 * Reads what someone typed into an AmountField. Accepts Persian, Arabic and Latin digits, any
 * thousands separators, and «.» or «٫» before decimals when the unit has them. Returns the
 * stored value (smallest unit, never negative) and the text to show back, which keeps a
 * trailing separator or zeros the person is still typing. Null value when empty.
 */
export function parseMoneyInput(
  text: string,
  unit: MoneyUnit,
  locale: Locale,
): { value: number | null; text: string } {
  const digits = unitFractionDigits(unit);
  const parsed = parseDecimalInput(text, digits);
  if (!parsed) return { value: null, text: "" };

  const whole = Number(parsed.integer);
  const fraction = parsed.fraction ?? "";
  const value =
    whole * MONEY_UNITS[unit].minorPerUnit +
    Number(fraction.padEnd(digits, "0") || 0);
  const shown =
    formatNumber(whole, locale) +
    (parsed.fraction === null
      ? ""
      : decimalSeparator(locale) + toLocaleDigits(fraction, locale));
  return { value, text: shown };
}
