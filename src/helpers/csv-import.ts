import { z } from "zod";

import {
  CSV_CELL_MAX_LENGTH,
  CSV_FIELD_HEADERS,
  CSV_FIELDS,
  CSV_FORMULA_START,
  CSV_IMPORT_MAX_ROWS,
} from "@/constants/csv";
import { MONEY_UNITS } from "@/constants/currency";
import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_NOTE_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TAGS_MAX,
} from "@/constants/transaction";
import { nextCategoryColor } from "@/helpers/category";
import { tidyDescription } from "@/helpers/transaction";
import type { CalendarSystem } from "@/types/calendar";
import type { Category, CategoryColor, CategoryType } from "@/types/category";
import type {
  CsvAmountMode,
  CsvColumnMap,
  CsvField,
  ImportMatch,
  ImportMatches,
  ImportPlan,
  ImportRecord,
  ImportRef,
  ImportRow,
  ImportRowError,
  ImportRowErrorCode,
  NewImportAccount,
  NewImportCategory,
  UnknownName,
} from "@/types/csv";
import type { Currency, RialUnit } from "@/types/currency";
import type {
  AccountOption,
  TransactionOptions,
  TransactionType,
} from "@/types/transaction";
import { unprotectFormula } from "@/utils/csv";
import { tidyName } from "@/utils/text";

import {
  type DateOrder,
  detectDateOrder,
  foldCsvText,
  importDateCalendar,
  parseImportAmount,
  parseImportDate,
  parseImportTags,
  parseImportType,
} from "./csv-values";

/*
 * The CSV import's rules, shared by the browser (the steps before saving) and the Server
 * Actions (which run them again on what the browser sends, with the book read fresh):
 *
 * 1. The column step maps the file's columns to fields (`guessColumnMap` starts it) and turns
 *    the rows into records: the mapped cells in `CSV_FIELDS` order.
 * 2. Every record is validated with Zod (`importRowSchema`): date, amount, type, names, text.
 * 3. Account and category names are looked up in the book; unknown ones go to the names step,
 *    where each becomes a new one or is matched to an existing one (`ImportMatches`).
 * 4. `planImport` gives the rows ready to add, the rows with errors and what will be created.
 */

/** A cell of a record. */
export function recordCell(record: ImportRecord, field: CsvField): string {
  return record.cells[CSV_FIELDS.indexOf(field)] ?? "";
}

/**
 * Guesses which column holds each field from the header names (the export's own headers in
 * both languages and common bank names). Each column is used once, the first match wins.
 */
export function guessColumnMap(headers: string[]): CsvColumnMap {
  const folded = headers.map(foldCsvText);
  const used = new Set<number>();
  const mapping = Object.fromEntries(
    CSV_FIELDS.map((field) => [field, null]),
  ) as CsvColumnMap;
  for (const field of CSV_FIELDS) {
    for (const alias of CSV_FIELD_HEADERS[field]) {
      const index = folded.findIndex(
        (header, column) => header === foldCsvText(alias) && !used.has(column),
      );
      if (index >= 0) {
        mapping[field] = index;
        used.add(index);
        break;
      }
    }
  }
  return mapping;
}

/** Separate types when a type column was found, signed amounts otherwise. */
export function guessAmountMode(mapping: CsvColumnMap): CsvAmountMode {
  return mapping.type === null ? "signed" : "typed";
}

/** Fields that need a column. The type only with separate types. */
export function requiredFields(mode: CsvAmountMode): CsvField[] {
  return mode === "typed"
    ? ["date", "amount", "type", "account"]
    : ["date", "amount", "account"];
}

/** Fields of the mapping that still need a column. */
export function missingFields(
  mapping: CsvColumnMap,
  mode: CsvAmountMode,
): CsvField[] {
  return requiredFields(mode).filter((field) => mapping[field] === null);
}

/** Fields whose text may have been protected from spreadsheets by an export (`protectFormula`). */
const TEXT_FIELDS = new Set<CsvField>([
  "account",
  "toAccount",
  "category",
  "subcategory",
  "description",
  "tags",
  "note",
]);

/**
 * The file's data rows as records. With `hasHeader` the first row is skipped; `line` counts it
 * anyway, so it matches the row number a spreadsheet shows. The type column is ignored with
 * signed amounts.
 */
export function toImportRecords(
  rows: string[][],
  hasHeader: boolean,
  mapping: CsvColumnMap,
  mode: CsvAmountMode,
): ImportRecord[] {
  const start = hasHeader ? 1 : 0;
  return rows.slice(start).map((row, index) => ({
    line: start + index + 1,
    cells: CSV_FIELDS.map((field) => {
      const column = mapping[field];
      if (column === null || (field === "type" && mode === "signed")) return "";
      const value = row[column] ?? "";
      return TEXT_FIELDS.has(field)
        ? unprotectFormula(value, CSV_FORMULA_START)
        : value;
    }),
  }));
}

/** How many records have dates of each calendar (the column step's note). */
export function countImportCalendars(
  records: ImportRecord[],
): Record<CalendarSystem, number> {
  const order = detectDateOrder(records.map((r) => recordCell(r, "date")));
  const counts: Record<CalendarSystem, number> = { jalali: 0, gregorian: 0 };
  for (const record of records) {
    const calendar = importDateCalendar(recordCell(record, "date"), order);
    if (calendar) counts[calendar]++;
  }
  return counts;
}

/** The first date the date column reads, as written and as an ISO date (the column step's hint). */
export function firstImportDate(
  records: ImportRecord[],
): { raw: string; iso: string } | null {
  const order = detectDateOrder(records.map((r) => recordCell(r, "date")));
  for (const record of records) {
    const raw = recordCell(record, "date");
    const parsed = parseImportDate(raw, order);
    if ("iso" in parsed) return { raw, iso: parsed.iso };
  }
  return null;
}

/** The format choices the rows need: how amounts carry the type and the unit. */
export type ImportFormat = {
  amountMode: CsvAmountMode;
  /** Rials or tomans, for an IRR book. */
  rialUnit: RialUnit | null;
};

/** Stored units in one unit the file writes: 10 for tomans, 100 for dollars. */
export function importMinorPerUnit(
  currency: Currency,
  rialUnit: RialUnit | null,
): number {
  return currency === "IRR"
    ? MONEY_UNITS[rialUnit ?? "rial"].minorPerUnit
    : MONEY_UNITS[currency].minorPerUnit;
}

/** A record after `importRowSchema`: checked values, names still as written. */
export type ParsedImportRow = {
  type: TransactionType;
  date: string;
  amount: number;
  account: string;
  toAccount: string | null;
  category: string | null;
  subcategory: string | null;
  description: string;
  note: string;
  tags: string[];
};

/** A failed custom check: its message is the error code. */
function fail(
  context: z.RefinementCtx,
  code: ImportRowErrorCode,
  path?: CsvField,
): typeof z.NEVER {
  context.addIssue({ code: "custom", message: code, path: path ? [path] : [] });
  return z.NEVER;
}

/** A text cell, tidied. */
const text = () => z.string().transform(tidyName);

/**
 * The rules of one row, as Zod: each cell is read and checked in the order of the fields, so
 * the first issue is the row's first problem, then the rules between cells. Messages are
 * `ImportRowErrorCode`s. The output is ready for name matching.
 */
export function importRowSchema({
  amountMode,
  minorPerUnit,
  dateOrder,
  today,
}: {
  amountMode: CsvAmountMode;
  minorPerUnit: number;
  dateOrder: DateOrder | null;
  today: string;
}) {
  return z
    .object({
      date: z.string().transform((value, context) => {
        const parsed = parseImportDate(value, dateOrder);
        if ("error" in parsed) return fail(context, parsed.error);
        if (parsed.iso > today) return fail(context, "dateFuture");
        return parsed.iso;
      }),
      amount: z.string().transform((value, context) => {
        const parsed = parseImportAmount(value, minorPerUnit);
        return "error" in parsed ? fail(context, parsed.error) : parsed;
      }),
      type: z.string().transform((value, context) => {
        if (amountMode === "signed") return null;
        if (value.trim() === "") return fail(context, "typeMissing");
        return parseImportType(value) ?? fail(context, "typeInvalid");
      }),
      account: text().pipe(z.string().min(1, "accountMissing")),
      toAccount: text(),
      category: text(),
      subcategory: text(),
      description: z
        .string()
        .transform(tidyDescription)
        .pipe(
          z
            .string()
            .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, "descriptionTooLong"),
        ),
      tags: z
        .string()
        .transform(parseImportTags)
        .pipe(
          z
            .array(z.string().max(TRANSACTION_TAG_MAX_LENGTH, "tagTooLong"))
            .max(TRANSACTION_TAGS_MAX, "tooManyTags"),
        ),
      note: z
        .string()
        .transform((note) => note.trim())
        .pipe(z.string().max(TRANSACTION_NOTE_MAX_LENGTH, "noteTooLong")),
    })
    .transform((row, context): ParsedImportRow => {
      // Signed amounts: a destination account makes a transfer, the sign says the rest.
      const type: TransactionType =
        row.type ??
        (row.toAccount
          ? "transfer"
          : row.amount.negative
            ? "expense"
            : "income");
      const isTransfer = type === "transfer";
      if (isTransfer && !row.toAccount) {
        return fail(context, "toAccountMissing", "toAccount");
      }
      if (
        isTransfer &&
        foldCsvText(row.toAccount) === foldCsvText(row.account)
      ) {
        return fail(context, "sameAccount", "toAccount");
      }
      if (!isTransfer && row.subcategory && !row.category) {
        return fail(context, "subcategoryWithoutCategory", "subcategory");
      }
      return {
        type,
        date: row.date,
        amount: row.amount.minor,
        account: row.account,
        toAccount: isTransfer ? row.toAccount : null,
        category: isTransfer ? null : row.category || null,
        subcategory: isTransfer ? null : row.subcategory || null,
        description: row.description,
        note: row.note,
        tags: row.tags,
      };
    });
}

/** What planImport works with: the book as it is now, its currency and the viewer's today. */
export type ImportContext = {
  book: TransactionOptions;
  currency: Currency;
  today: string;
};

/** Keys of unknown names in `ImportMatches`. */
export function accountKey(name: string): string {
  return `account:${foldCsvText(name)}`;
}

export function categoryKey(type: CategoryType, name: string): string {
  return `category:${type}:${foldCsvText(name)}`;
}

export function subcategoryKey(
  type: CategoryType,
  parent: ImportRef,
  name: string,
): string {
  const parentKey = parent.kind === "existing" ? parent.id : parent.key;
  return `subcategory:${type}:${parentKey}:${foldCsvText(name)}`;
}

/** Lookups of the book's names, folded, archived ones included. */
function indexBook(book: TransactionOptions) {
  const accounts = new Map<string, AccountOption>();
  for (const account of book.accounts) {
    accounts.set(foldCsvText(account.name), account);
  }
  const categories = {
    expense: new Map<string, Category>(),
    income: new Map<string, Category>(),
  };
  const categoryById = new Map<string, Category>();
  for (const type of ["expense", "income"] as const) {
    for (const category of book.categories[type]) {
      categories[type].set(foldCsvText(category.name), category);
      categoryById.set(category.id, category);
    }
  }
  return { accounts, categories, categoryById };
}

/** Whether one name's words include all of the other's: «کارت ملت» and «ملت». */
function namesOverlap(a: string, b: string): boolean {
  const wordsA = foldCsvText(a).split(" ");
  const wordsB = foldCsvText(b).split(" ");
  const [short, long] =
    wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  return short.every((word) => long.includes(word));
}

/**
 * The first choice for an unknown name: an active account or category whose name overlaps it
 * («کارت ملت» → «ملت»), otherwise a new one.
 */
export function suggestMatch(
  name: UnknownName,
  book: TransactionOptions,
): ImportMatch {
  const index = indexBook(book);
  const candidates: { id: string; name: string }[] =
    name.kind === "account"
      ? book.accounts.filter((account) => !account.archived)
      : name.kind === "category"
        ? book.categories[name.type].filter((category) => !category.archived)
        : name.parent.kind === "existing"
          ? (index.categoryById
              .get(name.parent.id)
              ?.subcategories.filter((sub) => !sub.archived) ?? [])
          : [];
  return (
    candidates.find((candidate) => namesOverlap(candidate.name, name.name))
      ?.id ?? "new"
  );
}

/** What a resolved name points to, or why it doesn't. */
type Resolved =
  { ok: true; ref: ImportRef | null } | { ok: false; code: ImportRowErrorCode };

/**
 * Plans an import: validates every record, looks its names up and applies the choices of the
 * names step. Returns the rows ready to add, the rows with errors (the first problem of each),
 * the accounts and categories to create (only those ready rows use) and every unknown name
 * found (for the names step; a name without a choice makes its rows fail).
 */
export function planImport(
  records: ImportRecord[],
  format: ImportFormat,
  { book, currency, today }: ImportContext,
  matches: ImportMatches,
): ImportPlan & { names: UnknownName[] } {
  const index = indexBook(book);
  const schema = importRowSchema({
    amountMode: format.amountMode,
    minorPerUnit: importMinorPerUnit(currency, format.rialUnit),
    dateOrder: detectDateOrder(records.map((r) => recordCell(r, "date"))),
    today,
  });

  const names = new Map<string, UnknownName>();
  const newAccounts = new Map<string, NewImportAccount>();
  const newCategories = new Map<string, Omit<NewImportCategory, "color">>();
  const rows: ImportRow[] = [];
  const errors: ImportRowError[] = [];

  /** Notes an unknown name (counting its rows) and returns the choice made for it. */
  function unknown(entry: UnknownName): ImportMatch | undefined {
    const known = names.get(entry.key);
    if (known) known.rows++;
    else names.set(entry.key, { ...entry, rows: 1 });
    return matches[entry.key];
  }

  function resolveAccount(name: string): Resolved {
    const existing = index.accounts.get(foldCsvText(name));
    if (existing)
      return { ok: true, ref: { kind: "existing", id: existing.id } };
    const key = accountKey(name);
    const choice = unknown({ kind: "account", key, name, rows: 0 });
    if (choice === "new") {
      if (!newAccounts.has(key)) newAccounts.set(key, { key, name });
      return { ok: true, ref: { kind: "new", key } };
    }
    if (choice && book.accounts.some((account) => account.id === choice)) {
      return { ok: true, ref: { kind: "existing", id: choice } };
    }
    return { ok: false, code: "accountUnmatched" };
  }

  function resolveCategory(
    type: CategoryType,
    name: string,
    subName: string | null,
  ): Resolved {
    let parent: ImportRef;
    const existing = index.categories[type].get(foldCsvText(name));
    if (existing) {
      parent = { kind: "existing", id: existing.id };
    } else {
      const key = categoryKey(type, name);
      const choice = unknown({ kind: "category", key, name, type, rows: 0 });
      if (choice === "none") return { ok: true, ref: null };
      if (choice === "new") {
        if (!newCategories.has(key)) {
          newCategories.set(key, { key, name, type, parent: null });
        }
        parent = { kind: "new", key };
      } else {
        const chosen = choice ? index.categoryById.get(choice) : undefined;
        if (!chosen || chosen.type !== type) {
          return { ok: false, code: "categoryUnmatched" };
        }
        parent = { kind: "existing", id: chosen.id };
      }
    }
    if (!subName) return { ok: true, ref: parent };

    const siblings =
      parent.kind === "existing"
        ? (index.categoryById.get(parent.id)?.subcategories ?? [])
        : [];
    const sub = siblings.find(
      (candidate) => foldCsvText(candidate.name) === foldCsvText(subName),
    );
    if (sub) return { ok: true, ref: { kind: "existing", id: sub.id } };

    const key = subcategoryKey(type, parent, subName);
    const parentName =
      parent.kind === "existing"
        ? (index.categoryById.get(parent.id)?.name ?? name)
        : name;
    const choice = unknown({
      kind: "subcategory",
      key,
      name: subName,
      type,
      parent,
      parentName,
      rows: 0,
    });
    if (choice === "none") return { ok: true, ref: parent };
    if (choice === "new") {
      if (!newCategories.has(key)) {
        newCategories.set(key, { key, name: subName, type, parent });
      }
      return { ok: true, ref: { kind: "new", key } };
    }
    if (choice && siblings.some((candidate) => candidate.id === choice)) {
      return { ok: true, ref: { kind: "existing", id: choice } };
    }
    return { ok: false, code: "categoryUnmatched" };
  }

  for (const record of records) {
    const raw = Object.fromEntries(
      CSV_FIELDS.map((field) => [field, recordCell(record, field)]),
    );
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const [issue] = parsed.error.issues;
      const field = (issue?.path[0] ?? "date") as CsvField;
      errors.push({
        line: record.line,
        code: (issue?.message ?? "dateFormat") as ImportRowErrorCode,
        value: recordCell(record, field),
      });
      continue;
    }

    const row = parsed.data;
    const account = resolveAccount(row.account);
    const toAccount = row.toAccount
      ? resolveAccount(row.toAccount)
      : ({ ok: true, ref: null } as const);
    const category =
      row.category && row.type !== "transfer"
        ? resolveCategory(row.type, row.category, row.subcategory)
        : ({ ok: true, ref: null } as const);

    const failed = (
      [
        ["account", account],
        ["toAccount", toAccount],
        ["category", category],
      ] as const
    ).find(([, resolved]) => !resolved.ok);
    if (failed && !failed[1].ok) {
      errors.push({
        line: record.line,
        code: failed[1].code,
        value: recordCell(record, failed[0]),
      });
      continue;
    }
    if (!account.ok || !account.ref || !toAccount.ok || !category.ok) continue;
    // Two names can still meet in one account («کارت ملت» matched to «ملت»).
    if (toAccount.ref && sameRef(account.ref, toAccount.ref)) {
      errors.push({
        line: record.line,
        code: "sameAccount",
        value: recordCell(record, "toAccount"),
      });
      continue;
    }
    rows.push({
      line: record.line,
      type: row.type,
      date: row.date,
      amount: row.amount,
      account: account.ref,
      toAccount: toAccount.ref,
      category: category.ref,
      description: row.description,
      note: row.note,
      tags: row.tags,
    });
  }

  const plan = usedNewItems(
    rows,
    [...newAccounts.values()],
    [...newCategories.values()],
  );
  const knownTags = new Set(book.tags);
  const tags = [...new Set(rows.flatMap((row) => row.tags))].filter(
    (tag) => !knownTags.has(tag),
  );

  return {
    rows,
    errors,
    accounts: plan.accounts,
    categories: colorNewCategories(plan.categories, book),
    tags,
    names: [...names.values()],
  };
}

function sameRef(a: ImportRef, b: ImportRef): boolean {
  return a.kind === "existing" && b.kind === "existing"
    ? a.id === b.id
    : a.kind === "new" && b.kind === "new" && a.key === b.key;
}

/**
 * The new accounts and categories the rows use (a subcategory's new parent counts as used).
 * Rows left out later (skipped duplicates) leave theirs out too.
 */
export function usedNewItems<Item extends Omit<NewImportCategory, "color">>(
  rows: ImportRow[],
  accounts: NewImportAccount[],
  categories: Item[],
): { accounts: NewImportAccount[]; categories: Item[] } {
  const used = new Set<string>();
  for (const row of rows) {
    for (const ref of [row.account, row.toAccount, row.category]) {
      if (ref?.kind === "new") used.add(ref.key);
    }
  }
  for (const category of categories) {
    if (used.has(category.key) && category.parent?.kind === "new") {
      used.add(category.parent.key);
    }
  }
  return {
    accounts: accounts.filter((account) => used.has(account.key)),
    // Parents before their subcategories, as they must be created.
    categories: categories
      .filter((category) => used.has(category.key))
      .sort((a, b) => Number(a.parent !== null) - Number(b.parent !== null)),
  };
}

/**
 * Colors new categories as the categories page would: the next free hue of their siblings
 * (`nextCategoryColor`); subcategories take their parent's.
 */
export function colorNewCategories(
  categories: Omit<NewImportCategory, "color">[],
  book: TransactionOptions,
): NewImportCategory[] {
  const used: Record<CategoryType, CategoryColor[]> = {
    expense: book.categories.expense.map((category) => category.color),
    income: book.categories.income.map((category) => category.color),
  };
  const colors = new Map<string, CategoryColor>();
  const colored: NewImportCategory[] = [];
  for (const category of categories) {
    let color: CategoryColor;
    if (!category.parent) {
      color = nextCategoryColor(used[category.type]);
      used[category.type].push(color);
    } else if (category.parent.kind === "new") {
      color = colors.get(category.parent.key) ?? "slate";
    } else {
      const parentId = category.parent.id;
      color =
        book.categories[category.type].find((parent) => parent.id === parentId)
          ?.color ?? "slate";
    }
    colors.set(category.key, color);
    colored.push({ ...category, color });
  }
  return colored;
}

/**
 * Choices for every unknown name: the ones made, and a suggestion for the rest. Subcategories
 * depend on their category's choice, so this repeats until no new name turns up.
 */
export function completeMatches(
  records: ImportRecord[],
  format: ImportFormat,
  context: ImportContext,
  matches: ImportMatches,
): { matches: ImportMatches; names: UnknownName[] } {
  let current = matches;
  for (let round = 0; round < 3; round++) {
    const { names } = planImport(records, format, context, current);
    const missing = names.filter((name) => current[name.key] === undefined);
    if (missing.length === 0) return { matches: current, names };
    current = { ...current };
    for (const name of missing) {
      current[name.key] = suggestMatch(name, context.book);
    }
  }
  return {
    matches: current,
    names: planImport(records, format, context, current).names,
  };
}

/**
 * What the browser sends to save an import, checked before anything else: the records (mapped
 * cells only), the format, the names step's choices and the duplicates to add anyway.
 */
export const importPayloadSchema = z.object({
  amountMode: z.enum(["typed", "signed"]),
  rialUnit: z.enum(["rial", "toman"]).nullable(),
  records: z
    .array(
      z.object({
        line: z.number().int().positive(),
        cells: z
          .array(z.string().max(CSV_CELL_MAX_LENGTH))
          .length(CSV_FIELDS.length),
      }),
    )
    .min(1)
    .max(CSV_IMPORT_MAX_ROWS),
  matches: z.record(
    z.string().max(400),
    z.union([z.enum(["new", "none"]), z.uuid()]),
  ),
  addDuplicates: z.array(z.number().int().positive()).max(CSV_IMPORT_MAX_ROWS),
});

export type ImportPayload = z.infer<typeof importPayloadSchema>;

/** What the browser sends to look for possible duplicates of ready rows. */
export const duplicateQuerySchema = z
  .array(
    z.object({
      line: z.number().int().positive(),
      date: z.iso.date(),
      accountId: z.uuid(),
      amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
      type: z.enum(["expense", "income", "transfer"]),
    }),
  )
  .max(CSV_IMPORT_MAX_ROWS);

export type DuplicateQuery = z.infer<typeof duplicateQuerySchema>;

/** Ready rows that could duplicate a stored transaction: those into an existing account. */
export function duplicateQuery(rows: ImportRow[]): DuplicateQuery {
  return rows.flatMap((row) =>
    row.account.kind === "existing"
      ? [
          {
            line: row.line,
            date: row.date,
            accountId: row.account.id,
            amount: row.amount,
            type: row.type,
          },
        ]
      : [],
  );
}
