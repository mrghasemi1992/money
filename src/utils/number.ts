/*
 * Number formatting and parsing for both languages. Intl's fa-IR locale produces real Persian
 * digit characters with the «٬» thousands and «٫» decimal separators; en-US produces Latin
 * digits with «,» and «.».
 */

import { INTL_LOCALES } from "@/constants/locale";
import type { Locale } from "@/types/locale";

/** The minus sign the design uses (U+2212), without Intl's left-to-right mark. */
export const MINUS_SIGN = "−";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Decimal separators people type: «.» and the Persian «٫» (U+066B). */
const DECIMAL_MARKS = /[.٫]/;

const formatCache = new Map<string, Intl.NumberFormat>();

function numberFormat(
  locale: Locale,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = formatCache.get(key);
  if (!format) {
    format = new Intl.NumberFormat(INTL_LOCALES[locale], options);
    formatCache.set(key, format);
  }
  return format;
}

export type NumberFormatOptions = {
  /** Decimals always shown. Default 0. */
  minFractionDigits?: number;
  /** Most decimals shown; the rest is rounded. Default: minFractionDigits. */
  maxFractionDigits?: number;
};

/**
 * 2500000 → "۲٬۵۰۰٬۰۰۰" (fa) or "2,500,000" (en). Rounds to `maxFractionDigits` (default 0).
 * Negative numbers get «−» (U+2212).
 */
export function formatNumber(
  value: number,
  locale: Locale,
  { minFractionDigits = 0, maxFractionDigits }: NumberFormatOptions = {},
): string {
  const max = Math.max(
    maxFractionDigits ?? minFractionDigits,
    minFractionDigits,
  );
  const factor = 10 ** max;
  const rounded = Math.round(value * factor) / factor;
  const digits = numberFormat(locale, {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: max,
  }).format(Math.abs(rounded));
  return rounded < 0 ? MINUS_SIGN + digits : digits;
}

/** 85 → "۸۵٪" (fa) or "85%" (en). Takes a percentage (0–100+), not a ratio. */
export function formatPercent(percent: number, locale: Locale): string {
  return numberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percent / 100);
}

/** The decimal separator of the language: «٫» (fa) or «.» (en). */
export function decimalSeparator(locale: Locale): string {
  return locale === "fa" ? "٫" : ".";
}

/** Replaces Latin digits in any string with Persian digits: "1405/07/09" → "۱۴۰۵/۰۷/۰۹". */
export function toPersianDigits(text: string | number): string {
  return String(text).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[+digit]);
}

/** Writes the digits of a string the way the language does: Persian digits for fa, Latin for en. */
export function toLocaleDigits(text: string | number, locale: Locale): string {
  return locale === "fa" ? toPersianDigits(text) : String(text);
}

/** Replaces Persian and Arabic digits with Latin digits. */
export function toLatinDigits(text: string): string {
  return text
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

/** Longest digit run kept, so the result stays a safe integer (below 10^15). */
const MAX_DIGITS = 15;

/**
 * Turns user input with any mix of Persian, Arabic or Latin digits and separators
 * ("۲٬۵۰۰٬۰۰۰", "2,500,000", "٢٥٠٠٠٠٠") into a non-negative integer.
 * Everything that isn't a digit is dropped. Returns null when there are no digits.
 */
export function parseDigits(text: string): number | null {
  const digits = toLatinDigits(text).replace(/[^0-9]/g, "");
  if (digits === "") return null;
  return Number(digits.slice(0, MAX_DIGITS));
}

export type DecimalInput = {
  /** Latin digits before the decimal separator, without leading zeros ("0" when there are none). */
  integer: string;
  /** Latin digits after it, cut to the allowed decimals, or null when no separator was typed. */
  fraction: string | null;
};

/**
 * Splits typed text into the whole and decimal part, accepting any digits, «.» or «٫» as the
 * decimal separator and dropping everything else (thousands separators, spaces, letters).
 * With `maxFractionDigits` 0 every separator is dropped. Returns null when nothing was typed.
 */
export function parseDecimalInput(
  text: string,
  maxFractionDigits: number,
): DecimalInput | null {
  const latin = toLatinDigits(text);
  const mark = maxFractionDigits > 0 ? latin.search(DECIMAL_MARKS) : -1;
  const wholeText = mark === -1 ? latin : latin.slice(0, mark);
  const whole = wholeText.replace(/[^0-9]/g, "").slice(0, MAX_DIGITS);
  const fraction =
    mark === -1
      ? null
      : latin
          .slice(mark + 1)
          .replace(/[^0-9]/g, "")
          .slice(0, maxFractionDigits);
  if (whole === "" && fraction === null) return null;
  return { integer: whole.replace(/^0+(?=\d)/, "") || "0", fraction };
}
