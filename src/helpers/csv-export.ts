import { z } from "zod";

import { CSV_EXPORT_COLUMNS, CSV_FORMULA_START } from "@/constants/csv";
import { MINOR_UNITS_PER_MAJOR } from "@/constants/currency";
import type { CalendarSystem } from "@/types/calendar";
import type {
  CsvExportColumn,
  ExportedTransaction,
  ExportPreset,
} from "@/types/csv";
import type { Currency } from "@/types/currency";
import type { TransactionType } from "@/types/transaction";
import {
  monthRange,
  shiftMonth,
  toCalendarDate,
  fromCalendarDate,
} from "@/utils/calendar";
import { protectFormula } from "@/utils/csv";

import { formatConnectorDate } from "./connector";

/*
 * The CSV export (/transactions/export): one row per transaction, oldest first, with the date
 * in both calendars, the amount in the book currency's main unit and names instead of ids.
 * The header and the type words are in the exporting user's language; numbers and dates use
 * Latin digits, so spreadsheets read them as numbers and dates. The import reads the file back.
 */

/** The export's search params: a Gregorian date range and an optional account. */
export const exportParamsSchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
    account: z.uuid().optional(),
  })
  .refine((params) => params.from <= params.to);

export type ExportParams = z.infer<typeof exportParamsSchema>;

/** Where the export is served. */
export const EXPORT_PATH = "/transactions/export";

/** The export's URL for a range and an account (null: every account). */
export function exportHref(
  from: string,
  to: string,
  accountId: string | null,
): string {
  const search = new URLSearchParams({ from, to });
  if (accountId) search.set("account", accountId);
  return `${EXPORT_PATH}?${search}`;
}

/**
 * The range of an export preset in the viewer's calendar, as ISO dates, never past today:
 * this month (to today), last month, this year (to today). Null for «custom».
 */
export function exportPresetRange(
  preset: ExportPreset,
  calendar: CalendarSystem,
  today: string,
): { from: string; to: string } | null {
  const { year, month } = toCalendarDate(today, calendar);
  switch (preset) {
    case "month":
      return { from: monthRange(calendar, year, month).start, to: today };
    case "lastMonth": {
      const last = shiftMonth(year, month, -1);
      const { start, end } = monthRange(calendar, last.year, last.month);
      return { from: start, to: end };
    }
    case "year":
      return {
        from: fromCalendarDate({ year, month: 1, day: 1 }, calendar),
        to: today,
      };
    case "custom":
      return null;
  }
}

/** «money-2026-09-01-2026-09-30.csv». */
export function exportFileName(from: string, to: string): string {
  return `money-${from}-${to}.csv`;
}

/**
 * An amount in the smallest unit as the currency's main unit, without grouping: 8500000 rials
 * → "8500000", 123456 cents → "1234.56".
 */
export function formatMajorAmount(minor: number, currency: Currency): string {
  const perMajor = MINOR_UNITS_PER_MAJOR[currency];
  if (perMajor === 1) return String(minor);
  const digits = Math.round(Math.log10(perMajor));
  const whole = Math.floor(minor / perMajor);
  const fraction = String(minor % perMajor).padStart(digits, "0");
  return `${whole}.${fraction}`;
}

/** What the row needs besides the transaction: the currency and the language's words. */
export type ExportRowOptions = {
  currency: Currency;
  typeLabels: Record<TransactionType, string>;
  /** Between tags: «، » or «, ». */
  tagSeparator: string;
};

/** One row's cells, in `CSV_EXPORT_COLUMNS` order. Text that looks like a formula gets a «'». */
export function exportRow(
  transaction: ExportedTransaction,
  { currency, typeLabels, tagSeparator }: ExportRowOptions,
): string[] {
  const text = (value: string | null) =>
    protectFormula(value ?? "", CSV_FORMULA_START);
  const cells: Record<CsvExportColumn, string> = {
    gregorianDate: transaction.date,
    jalaliDate: formatConnectorDate(transaction.date, "jalali"),
    type: typeLabels[transaction.type],
    amount: formatMajorAmount(transaction.amount, currency),
    currency,
    account: text(transaction.accountName),
    toAccount: text(transaction.toAccountName),
    category: text(transaction.categoryName),
    subcategory: text(transaction.subcategoryName),
    description: text(transaction.description),
    tags: text(transaction.tags.join(tagSeparator)),
    note: text(transaction.note),
  };
  return CSV_EXPORT_COLUMNS.map((column) => cells[column]);
}
