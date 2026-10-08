/*
 * Writing CSV (RFC 4180): fields separated by commas, rows by CRLF, and a field quoted when it
 * holds a comma, a quote or a line break (quotes doubled). Reading lives in csv-parse.ts.
 */

/** Byte order mark: tells Excel the file is UTF-8, so Persian text opens correctly. */
export const CSV_BOM = "﻿";

const NEEDS_QUOTES = /[",\r\n]/;

/** One field, quoted when needed. */
export function csvField(value: string): string {
  return NEEDS_QUOTES.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** One row with its line break. */
export function csvRow(values: string[]): string {
  return `${values.map(csvField).join(",")}\r\n`;
}

/** A whole file: the BOM, then every row. */
export function csvText(rows: string[][]): string {
  return CSV_BOM + rows.map(csvRow).join("");
}

/**
 * Text that a spreadsheet would read as a formula («=HYPERLINK(…)», «+1», «@SUM») gets a «'»
 * in front, so opening an export never runs one (OWASP's advice for CSV injection).
 * `unprotectFormula` removes it again on import.
 */
export function protectFormula(value: string, formulaStart: RegExp): string {
  return formulaStart.test(value) ? `'${value}` : value;
}

/** Removes the «'» `protectFormula` added. */
export function unprotectFormula(value: string, formulaStart: RegExp): string {
  return value.startsWith("'") && formulaStart.test(value.slice(1))
    ? value.slice(1)
    : value;
}

/** Saves text as a file in the browser («Download»). */
export function downloadText(
  text: string,
  fileName: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Let the download start before the URL goes away.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
