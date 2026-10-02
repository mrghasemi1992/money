/*
 * Persian number formatting and parsing. Intl's fa-IR locale produces real Persian digit
 * characters and the Persian thousands separator «٬» (U+066C).
 */

const integerFormat = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
const percentFormat = new Intl.NumberFormat("fa-IR", {
  style: "percent",
  maximumFractionDigits: 0,
});

/** The minus sign the design uses (U+2212), without Intl's left-to-right mark. */
export const MINUS_SIGN = "−";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** 2500000 → "۲٬۵۰۰٬۰۰۰". Rounds to an integer. Negative numbers get «−» (U+2212). */
export function formatNumber(value: number): string {
  const digits = integerFormat.format(Math.abs(Math.round(value)));
  return value < 0 && Math.round(value) !== 0 ? MINUS_SIGN + digits : digits;
}

/** 2500000 → "۲٬۵۰۰٬۰۰۰ ریال". */
export function formatRial(value: number): string {
  return `${formatNumber(value)} ریال`;
}

/** 85 → "۸۵٪". Takes a percentage (0–100+), not a ratio. */
export function formatPercent(percent: number): string {
  return percentFormat.format(percent / 100);
}

/** Replaces Latin digits in any string with Persian digits: "1405/07/09" → "۱۴۰۵/۰۷/۰۹". */
export function toPersianDigits(text: string | number): string {
  return String(text).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[+digit]);
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
