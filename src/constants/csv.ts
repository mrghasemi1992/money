import type { TransactionType } from "@/types/transaction";

/*
 * CSV import and export (/settings/import-export). The import reads the file in the browser,
 * so the limits on the file are checked there first; the Server Actions check the rows again.
 */

/**
 * The largest file the import reads. The mapped rows go to a Server Action in one request,
 * and Vercel refuses request bodies above 4.5 MB, so the file stays below that.
 */
export const CSV_IMPORT_MAX_BYTES = 4 * 1024 * 1024;

/** The largest set of mapped rows sent to the Server Action (next.config's bodySizeLimit is above it). */
export const CSV_IMPORT_MAX_PAYLOAD_BYTES = 4.25 * 1024 * 1024;

/** Most data rows in one import (the header row not counted). */
export const CSV_IMPORT_MAX_ROWS = 10_000;

/** Longest text in one cell the import accepts; longer cells are a broken file. */
export const CSV_CELL_MAX_LENGTH = 1_000;

/** Rows the column step shows from the top of the file. */
export const CSV_PREVIEW_ROWS = 5;

/** Ready rows the review step lists before «و … ردیف دیگر». */
export const CSV_REVIEW_ROWS = 5;

/** Rows the export reads from the database per query while it streams the file. */
export const CSV_EXPORT_PAGE_SIZE = 1_000;

/** Rows per INSERT statement when an import is saved (all in one batch, one transaction). */
export const CSV_INSERT_CHUNK = 500;

/** Keys per query when looking for possible duplicates of the imported rows. */
export const CSV_DUPLICATE_CHUNK = 2_000;

/** The steps of the import, in order. */
export const IMPORT_STEPS = [
  "upload",
  "map",
  "match",
  "review",
  "result",
] as const;

/**
 * What the import reads from a file, in this order (also the order of a row's cells when it is
 * sent to the server). Date, amount and account are required; type too with separate types.
 */
export const CSV_FIELDS = [
  "date",
  "amount",
  "type",
  "account",
  "toAccount",
  "category",
  "subcategory",
  "description",
  "tags",
  "note",
] as const;

/** The export's columns, in order. Their names are the `importExport.columns` messages. */
export const CSV_EXPORT_COLUMNS = [
  "gregorianDate",
  "jalaliDate",
  "type",
  "amount",
  "currency",
  "account",
  "toAccount",
  "category",
  "subcategory",
  "description",
  "tags",
  "note",
] as const;

/**
 * Column names the import recognizes for each field, folded with `foldCsvText`: the export's
 * own headers in both languages first, then common names from bank and spreadsheet files.
 */
export const CSV_FIELD_HEADERS: Record<(typeof CSV_FIELDS)[number], string[]> =
  {
    date: [
      "تاریخ",
      "تاریخ میلادی",
      "تاریخ شمسی",
      "date",
      "gregorian date",
      "jalali date",
      "transaction date",
      "posting date",
    ],
    amount: ["مبلغ", "amount", "sum", "value"],
    type: ["نوع", "type", "transaction type"],
    account: ["حساب", "از حساب", "کارت", "account", "from account", "bank"],
    toAccount: ["حساب مقصد", "به حساب", "to account", "destination account"],
    category: ["دسته بندی", "دسته", "category"],
    subcategory: ["زیردسته", "زیر دسته", "subcategory", "sub category"],
    description: [
      "شرح",
      "توضیح",
      "توضیحات",
      "عنوان",
      "description",
      "details",
      "payee",
      "title",
    ],
    tags: ["برچسب ها", "برچسب", "tags", "tag", "labels"],
    note: ["یادداشت", "note", "notes", "memo", "comment"],
  };

/**
 * Words the type column may hold, folded with `foldCsvText`: the export's labels in both
 * languages and words banks use. Anything else is an error on that row.
 */
export const CSV_TYPE_WORDS: Record<TransactionType, string[]> = {
  expense: [
    "هزینه",
    "خرج",
    "برداشت",
    "خرید",
    "expense",
    "expenses",
    "debit",
    "withdrawal",
    "payment",
  ],
  income: ["درآمد", "دریافت", "واریز", "income", "credit", "deposit", "refund"],
  transfer: ["انتقال", "transfer"],
};

/** Characters that start a formula in spreadsheets; text cells starting with one get a «'». */
export const CSV_FORMULA_START = /^[=+\-@\t\r]/;

/** Ranges the export offers: this month, last month and this year of the viewer's calendar, or custom. */
export const EXPORT_PRESETS = ["month", "lastMonth", "year", "custom"] as const;
