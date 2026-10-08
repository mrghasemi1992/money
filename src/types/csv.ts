import type {
  CSV_EXPORT_COLUMNS,
  CSV_FIELDS,
  EXPORT_PRESETS,
  IMPORT_STEPS,
} from "@/constants/csv";

import type { CategoryColor, CategoryType } from "./category";
import type { RialUnit } from "./currency";
import type { TransactionInput } from "./transaction";

export type ImportStep = (typeof IMPORT_STEPS)[number];

/** A field the import reads from a column of the file. */
export type CsvField = (typeof CSV_FIELDS)[number];

export type CsvExportColumn = (typeof CSV_EXPORT_COLUMNS)[number];

export type ExportPreset = (typeof EXPORT_PRESETS)[number];

/** A CSV file as the browser read it. */
export type CsvFile = {
  name: string;
  /** Bytes. */
  size: number;
  /** «,», «;» or a tab, as detected. */
  delimiter: string;
  /** Every row of the file, the header row included, as text cells. */
  rows: string[][];
};

/** Which column of the file each field reads; null when no column holds it. */
export type CsvColumnMap = Record<CsvField, number | null>;

/**
 * How amounts carry the type: positive amounts with a separate type column, or signed amounts
 * (negative = expense, positive = income; a row with a destination account is a transfer).
 */
export type CsvAmountMode = "typed" | "signed";

/** Choices of the column step. */
export type ImportSettings = {
  mapping: CsvColumnMap;
  amountMode: CsvAmountMode;
  /** Whether the file's amounts are rials or tomans. Null until chosen; IRR books only. */
  rialUnit: RialUnit | null;
};

/**
 * One data row of the file with its mapped cells, in `CSV_FIELDS` order (empty for fields
 * without a column). `line` is the row's number in the file, the header being row 1, as a
 * spreadsheet numbers it.
 */
export type ImportRecord = { line: number; cells: string[] };

/**
 * What an unknown name becomes: a new account or category, an existing one (its id), or, for
 * categories, none (no category) and for subcategories none (the category itself).
 */
export type ImportMatch = "new" | "none" | (string & {});

/** Choices of the names step, by the key of each unknown name (see `importNameKey`). */
export type ImportMatches = Record<string, ImportMatch>;

/** An account, category or subcategory name in the file that the book doesn't have. */
export type UnknownName =
  | { kind: "account"; key: string; name: string; rows: number }
  | {
      kind: "category";
      key: string;
      name: string;
      type: CategoryType;
      rows: number;
    }
  | {
      kind: "subcategory";
      key: string;
      name: string;
      type: CategoryType;
      /** The category it belongs to: an existing id, or the key of a new one. */
      parent: ImportRef;
      parentName: string;
      rows: number;
    };

/** An account or category of an import: one the book has, or one the import creates. */
export type ImportRef =
  { kind: "existing"; id: string } | { kind: "new"; key: string };

/** Accounts, categories and subcategories the import creates. */
export type NewImportAccount = { key: string; name: string };

export type NewImportCategory = {
  key: string;
  name: string;
  type: CategoryType;
  /** Null for a top-level category. */
  parent: ImportRef | null;
  /** The next free hue of its siblings, or its parent's (see `colorNewCategories`). */
  color: CategoryColor;
};

/** A row ready to add: a transaction whose accounts and category may be new ones. */
export type ImportRow = Omit<
  TransactionInput,
  "accountId" | "toAccountId" | "categoryId"
> & {
  line: number;
  account: ImportRef;
  toAccount: ImportRef | null;
  category: ImportRef | null;
};

/** Keys of the `importExport.errors` messages. */
export type ImportRowErrorCode =
  | "dateMissing"
  | "dateFormat"
  | "dateInvalid"
  | "dateAmbiguous"
  | "dateFuture"
  | "amountMissing"
  | "amountInvalid"
  | "amountZero"
  | "amountDecimals"
  | "amountTooLarge"
  | "typeMissing"
  | "typeInvalid"
  | "accountMissing"
  | "accountUnmatched"
  | "toAccountMissing"
  | "sameAccount"
  | "categoryUnmatched"
  | "subcategoryWithoutCategory"
  | "descriptionTooLong"
  | "noteTooLong"
  | "tagTooLong"
  | "tooManyTags";

/** A row that can't be added, with the first reason and the cell it is about. */
export type ImportRowError = {
  line: number;
  code: ImportRowErrorCode;
  /** The cell's text, for messages that quote it. */
  value: string;
};

/** What the import would add from a file. */
export type ImportPlan = {
  rows: ImportRow[];
  errors: ImportRowError[];
  accounts: NewImportAccount[];
  categories: NewImportCategory[];
  /** Tags of the file the book doesn't use yet. */
  tags: string[];
};

/** A ready row that looks like a transaction the book already has. */
export type ImportDuplicate = {
  line: number;
  /** The transaction already in the book: same date, account, amount and type. */
  date: string;
  accountId: string;
  description: string;
};

/** What a saved import did. */
export type ImportResult = {
  added: number;
  /** Possible duplicates left out. */
  skipped: number;
  /** Rows with errors. */
  failed: number;
  created: { accounts: number; categories: number; subcategories: number };
};

/** A transaction as the CSV export writes it: names instead of ids. */
export type ExportedTransaction = {
  type: TransactionInput["type"];
  date: string;
  /** In the book currency's smallest unit. */
  amount: number;
  accountName: string;
  toAccountName: string | null;
  /** The top-level category, and the subcategory when the transaction has one. */
  categoryName: string | null;
  subcategoryName: string | null;
  description: string;
  note: string;
  tags: string[];
};
