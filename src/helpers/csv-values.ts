import { CSV_TYPE_WORDS } from "@/constants/csv";
import type { CalendarSystem } from "@/types/calendar";
import type { ImportRowErrorCode } from "@/types/csv";
import type { TransactionType } from "@/types/transaction";
import { fromCalendarDate, isValidCalendarDate } from "@/utils/calendar";
import { toLatinDigits } from "@/utils/number";
import { normalizePersian, tidyName } from "@/utils/text";

/*
 * Reading the cells of an imported CSV file: dates of either calendar, amounts written with
 * any digits and separators, the type column and tags. Pure functions, shared by the browser
 * (the review before saving) and the Server Action (which checks every row again).
 */

/**
 * Folds text for comparing names and headers: Persian «ی» «ک» for Arabic ones, ZWNJ as a space,
 * no diacritics, lowercase, single spaces. «حمل‌ونقل» and «حمل ونقل» fold the same.
 */
export function foldCsvText(text: string): string {
  return normalizePersian(tidyName(text)).replace(/\s+/g, " ").trim();
}

/** Years below this are Jalali, from it on Gregorian (as everywhere else in Money). */
const GREGORIAN_YEAR_MIN = 1700;

/** «1405/06/24», «2026-09-15», «2026.09.15», with an optional time after it. */
const YEAR_FIRST = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T].*)?$/;

/** «15/09/2026» or «9/15/2026» (what Excel writes back), with an optional time after it. */
const YEAR_LAST = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[ T,].*)?$/;

/** Order of day and month in dates written with the year last. */
export type DateOrder = "dmy" | "mdy";

/** Writing marks that can surround text copied from a right-to-left document. */
const BIDI_MARKS = /[‎‏‪-‮⁦-⁩]/g;

function cleanDate(value: string): string {
  return toLatinDigits(value).replace(BIDI_MARKS, "").trim();
}

/**
 * The order of day and month in a file's year-last dates, from the dates that tell: a first
 * part above 12 is a day (15/09/2026), a second part above 12 too (9/15/2026). Null when none
 * tells (every day is 12 or less) or the file has no such dates.
 */
export function detectDateOrder(values: string[]): DateOrder | null {
  let dmy = 0;
  let mdy = 0;
  for (const value of values) {
    const match = YEAR_LAST.exec(cleanDate(value));
    if (!match) continue;
    if (Number(match[1]) > 12) dmy++;
    else if (Number(match[2]) > 12) mdy++;
  }
  if (dmy === 0 && mdy === 0) return null;
  return dmy >= mdy ? "dmy" : "mdy";
}

export type ParsedDate =
  | { iso: string; calendar: CalendarSystem }
  | {
      error: Extract<
        ImportRowErrorCode,
        "dateMissing" | "dateFormat" | "dateInvalid" | "dateAmbiguous"
      >;
    };

/**
 * A date cell as a Gregorian ISO date. The year says the calendar, row by row: «1405/06/24» is
 * Jalali, «2026-09-15» Gregorian, so one file may hold both. Persian and Arabic digits are
 * accepted. Year-last dates need `order` (see detectDateOrder).
 */
export function parseImportDate(
  value: string,
  order: DateOrder | null,
): ParsedDate {
  const text = cleanDate(value);
  if (text === "") return { error: "dateMissing" };

  let parts: { year: number; month: number; day: number };
  const yearFirst = YEAR_FIRST.exec(text);
  if (yearFirst) {
    parts = {
      year: Number(yearFirst[1]),
      month: Number(yearFirst[2]),
      day: Number(yearFirst[3]),
    };
  } else {
    const yearLast = YEAR_LAST.exec(text);
    if (!yearLast) return { error: "dateFormat" };
    const first = Number(yearLast[1]);
    const second = Number(yearLast[2]);
    // A date that tells by itself needs no order: 15/09 can only be the 15th.
    const rowOrder: DateOrder | null =
      first > 12
        ? "dmy"
        : second > 12
          ? "mdy"
          : first === second
            ? "dmy"
            : order;
    if (!rowOrder) return { error: "dateAmbiguous" };
    parts = {
      year: Number(yearLast[3]),
      month: rowOrder === "dmy" ? second : first,
      day: rowOrder === "dmy" ? first : second,
    };
  }

  const calendar: CalendarSystem =
    parts.year >= GREGORIAN_YEAR_MIN ? "gregorian" : "jalali";
  if (!isValidCalendarDate(parts, calendar)) return { error: "dateInvalid" };
  return { iso: fromCalendarDate(parts, calendar), calendar };
}

/** The calendar a date cell is written in, or null when it isn't a date. */
export function importDateCalendar(
  value: string,
  order: DateOrder | null,
): CalendarSystem | null {
  const parsed = parseImportDate(value, order);
  return "iso" in parsed ? parsed.calendar : null;
}

export type ParsedAmount =
  | {
      /** In the book's smallest unit, never negative. */
      minor: number;
      negative: boolean;
    }
  | {
      error: Extract<
        ImportRowErrorCode,
        | "amountMissing"
        | "amountInvalid"
        | "amountZero"
        | "amountDecimals"
        | "amountTooLarge"
      >;
    };

/** Currency marks a bank file may write next to the number. */
const CURRENCY_MARKS =
  /ریال|تومان|دلار|یورو|پوند|rials?|tomans?|irr|irt|usd|eur|gbp|[$€£﷼]/gi;

const MINUS = /^[-−–]/;
const TRAILING_MINUS = /[-−–]$/;

/** Longest run of whole digits kept, so the result stays a safe integer. */
const MAX_WHOLE_DIGITS = 15;

/**
 * An amount cell in the smallest unit (`minorPerUnit` of them in one written unit: 10 for
 * tomans, 100 for dollars). Accepts Persian, Arabic and Latin digits; «٬» and «,» between
 * thousands; «.» and «٫» before decimals, or «,» before at most two decimals (1.234,56);
 * a minus in front or behind, or parentheses, for negative amounts; and a currency mark.
 * Anything else («12,O00») is not a number.
 */
export function parseImportAmount(
  value: string,
  minorPerUnit: number,
): ParsedAmount {
  let text = toLatinDigits(value)
    .replace(BIDI_MARKS, "")
    .replace(/٫/g, ".")
    .replace(/٬/g, ",")
    .replace(CURRENCY_MARKS, "")
    .replace(/[\s ‌]/g, "");
  if (text === "") return { error: "amountMissing" };

  let negative = false;
  if (text.startsWith("(") && text.endsWith(")")) {
    negative = true;
    text = text.slice(1, -1);
  }
  if (MINUS.test(text)) {
    negative = true;
    text = text.slice(1);
  } else if (text.startsWith("+")) {
    text = text.slice(1);
  } else if (TRAILING_MINUS.test(text)) {
    negative = true;
    text = text.slice(0, -1);
  }
  if (!/^[\d.,]+$/.test(text) || !/\d/.test(text)) {
    return { error: "amountInvalid" };
  }

  const fractionDigits = Math.round(Math.log10(minorPerUnit));
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  let decimalMark: "." | "," | null;
  if (lastDot >= 0 && lastComma >= 0) {
    decimalMark = lastDot > lastComma ? "." : ",";
  } else if (lastComma >= 0) {
    if (/^\d{1,3}(,\d{3})+$/.test(text)) decimalMark = null;
    else if (/^\d+,\d{1,2}$/.test(text)) decimalMark = ",";
    else return { error: "amountInvalid" };
  } else if (lastDot >= 0) {
    // 1.234.567 groups thousands; so does 1.000 for a unit without decimals (rials).
    if (/^\d{1,3}(\.\d{3}){2,}$/.test(text)) decimalMark = null;
    else if (fractionDigits === 0 && /^\d{1,3}\.\d{3}$/.test(text)) {
      decimalMark = null;
    } else if (/^\d*\.\d+$/.test(text)) decimalMark = ".";
    else return { error: "amountInvalid" };
  } else {
    decimalMark = null;
  }

  const markAt = decimalMark ? text.lastIndexOf(decimalMark) : -1;
  const wholeText = markAt >= 0 ? text.slice(0, markAt) : text;
  const fractionText = markAt >= 0 ? text.slice(markAt + 1) : "";
  // Without a decimal mark, whichever separator the number has groups thousands.
  const thousands =
    decimalMark === "," || (decimalMark === null && lastDot >= 0) ? "." : ",";
  const whole = wholeText.split(thousands).join("");
  if (!/^\d*$/.test(whole) || !/^\d*$/.test(fractionText)) {
    return { error: "amountInvalid" };
  }

  const fraction = fractionText.replace(/0+$/, "");
  if (fraction.length > fractionDigits) return { error: "amountDecimals" };
  const digits = whole.replace(/^0+/, "");
  if (digits.length > MAX_WHOLE_DIGITS) return { error: "amountTooLarge" };

  const minor =
    Number(digits || "0") * minorPerUnit +
    Number(fraction.padEnd(fractionDigits, "0") || "0");
  if (!Number.isSafeInteger(minor)) return { error: "amountTooLarge" };
  if (minor === 0) return { error: "amountZero" };
  return { minor, negative };
}

const TYPE_BY_WORD = new Map<string, TransactionType>(
  (Object.entries(CSV_TYPE_WORDS) as [TransactionType, string[]][]).flatMap(
    ([type, words]) => words.map((word) => [foldCsvText(word), type] as const),
  ),
);

/** The type column's word as a transaction type, or null when it isn't one Money knows. */
export function parseImportType(value: string): TransactionType | null {
  return TYPE_BY_WORD.get(foldCsvText(value)) ?? null;
}

/**
 * The tags of a cell: separated by «،», «,», «;» or «|», a leading «#» dropped, tidied, each
 * once.
 */
export function parseImportTags(value: string): string[] {
  const tags = value
    .split(/[,،;|]/)
    .map((tag) => tidyName(tag.replace(/^#/, "")))
    .filter(Boolean);
  return [...new Set(tags)];
}
