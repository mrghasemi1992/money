import "server-only";

import { and, asc, desc, eq, inArray, type SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  TRANSACTION_PAGE_SIZE,
  TRANSACTION_TAG_SUGGESTIONS_MAX,
  UNKNOWN_DESCRIPTION,
} from "@/constants/transaction";
import type {
  AccountOption,
  Transaction,
  TransactionDayTotal,
  TransactionFilters,
  TransactionInput,
  TransactionOptions,
  TransactionPage,
  TransactionSource,
  TransactionTotals,
} from "@/types/transaction";
import { normalizePersian } from "@/utils/text";

import { listCategories } from "./categories";
import { db } from "./index";
import { accounts, categories, transactions, user } from "./schema";

/*
 * Transactions of the shared book. The callers check the role first (requireUser() to read,
 * requireWrite() to change, and the MCP tools with the token's user, src/mcp); these
 * functions only read and write, and take the acting user's id for created_by / updated_by.
 * The database enforces the type rules too (see the schema), so a bug here can't store a
 * transfer with a category or an expense in an income category.
 */

/** A column of `transactions`, qualified: safe inside subqueries of a one-table query. */
function column(name: string): SQL {
  return sql`${transactions}.${sql.identifier(name)}`;
}

/**
 * Folds text in SQL the way normalizePersian folds the search: lowercase, Arabic «ي» «ى» «ك»
 * to Persian, ZWNJ to a space.
 */
function folded(value: SQL): SQL {
  return sql`translate(lower(${value}), ${"يىك‌"}, ${"ییک "})`;
}

/** Escapes LIKE's wildcards so a search for «50%» means the characters. */
function likePattern(search: string): string {
  const needle = normalizePersian(search).replace(/\s+/g, " ").trim();
  return `%${needle.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/** WHERE conditions for the filters. Works with or without joins: columns are qualified. */
function filterConditions(filters: TransactionFilters): SQL | undefined {
  const conditions: (SQL | undefined)[] = [];
  if (filters.from) conditions.push(sql`${column("date")} >= ${filters.from}`);
  if (filters.to) conditions.push(sql`${column("date")} <= ${filters.to}`);
  if (filters.types.length > 0) {
    conditions.push(inArray(column("type"), filters.types));
  }
  if (filters.accountId) {
    conditions.push(
      sql`(${column("account_id")} = ${filters.accountId} or ${column("to_account_id")} = ${filters.accountId})`,
    );
  }
  if (filters.categoryId) {
    // The category itself and, for a top-level category, its subcategories.
    conditions.push(
      sql`${column("category_id")} in (
        select c.id from ${categories} c
        where c.id = ${filters.categoryId} or c.parent_id = ${filters.categoryId}
      )`,
    );
  }
  if (filters.tag) {
    conditions.push(sql`${column("tags")} @> array[${filters.tag}]::text[]`);
  }
  if (filters.unknownOnly) {
    conditions.push(
      sql`btrim(${column("description")}) in ('', ${UNKNOWN_DESCRIPTION}, '?')`,
    );
  }
  if (filters.search) {
    const pattern = likePattern(filters.search);
    conditions.push(sql`(
      ${folded(column("description"))} like ${pattern}
      or ${folded(column("note"))} like ${pattern}
      or ${folded(sql`array_to_string(${column("tags")}, ' ')`)} like ${pattern}
      or exists (
        select 1 from ${categories} c
        left join ${categories} p on p.id = c.parent_id
        where c.id = ${column("category_id")}
          and (${folded(sql`c.name`)} like ${pattern} or ${folded(sql`coalesce(p.name, '')`)} like ${pattern})
      )
    )`);
  }
  return and(...conditions);
}

/**
 * Cursor of the row a page ended on: date, creation time (microseconds, as text, so no row
 * is skipped or repeated) and id. The list is ordered by the same three, newest first.
 */
type Cursor = { date: string; createdAt: string; id: string };

function encodeCursor(cursor: Cursor): string {
  return [cursor.date, cursor.createdAt, cursor.id].join("|");
}

function decodeCursor(value: string | null | undefined): Cursor | null {
  if (!value) return null;
  const [date, createdAt, id] = value.split("|");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ||
    !/^[\d\-T:.Z]+$/.test(createdAt ?? "") ||
    !/^[0-9a-f-]{36}$/.test(id ?? "")
  ) {
    return null;
  }
  return { date, createdAt, id };
}

const toAccount = alias(accounts, "to_account");
const parent = alias(categories, "parent");
const creator = alias(user, "creator");
const editor = alias(user, "editor");

/**
 * One page of transactions matching the filters, newest first (by date, then by when they
 * were added), with their accounts, category and who added and last changed them. Keyset
 * pagination on (date, created_at, id), so later pages cost the same as the first.
 */
export async function listTransactions(
  filters: TransactionFilters,
  cursor?: string | null,
  limit = TRANSACTION_PAGE_SIZE,
): Promise<TransactionPage> {
  const after = decodeCursor(cursor);
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      date: transactions.date,
      amount: transactions.amount,
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
      categoryId: transactions.categoryId,
      description: transactions.description,
      note: transactions.note,
      tags: transactions.tags,
      source: transactions.source,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      cursorTime: sql<string>`to_char(${transactions.createdAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
      accountName: accounts.name,
      accountType: accounts.type,
      toAccountName: toAccount.name,
      toAccountType: toAccount.type,
      categoryName: categories.name,
      categoryColor: categories.color,
      parentName: parent.name,
      parentColor: parent.color,
      creatorId: creator.id,
      creatorName: creator.name,
      editorId: editor.id,
      editorName: editor.name,
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .leftJoin(toAccount, eq(toAccount.id, transactions.toAccountId))
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .leftJoin(parent, eq(parent.id, categories.parentId))
    .innerJoin(creator, eq(creator.id, transactions.createdBy))
    .innerJoin(editor, eq(editor.id, transactions.updatedBy))
    .where(
      and(
        filterConditions(filters),
        after
          ? sql`(${transactions.date}, ${transactions.createdAt}, ${transactions.id}) < (${after.date}::date, ${after.createdAt}::timestamptz, ${after.id}::uuid)`
          : undefined,
      ),
    )
    .orderBy(
      desc(transactions.date),
      desc(transactions.createdAt),
      desc(transactions.id),
    )
    .limit(limit + 1);

  const page = rows.slice(0, limit);
  const last = page.at(-1);
  return {
    rows: page.map((row): Transaction => ({
      id: row.id,
      type: row.type,
      date: row.date,
      amount: row.amount,
      accountId: row.accountId,
      toAccountId: row.toAccountId,
      categoryId: row.categoryId,
      description: row.description,
      note: row.note,
      tags: row.tags,
      source: row.source,
      account: {
        id: row.accountId,
        name: row.accountName,
        type: row.accountType,
      },
      toAccount:
        row.toAccountId && row.toAccountName && row.toAccountType
          ? {
              id: row.toAccountId,
              name: row.toAccountName,
              type: row.toAccountType,
            }
          : null,
      category:
        row.categoryName && row.categoryColor
          ? {
              name: row.categoryName,
              parentName: row.parentName,
              color: row.parentColor ?? row.categoryColor,
            }
          : null,
      createdBy: { id: row.creatorId, name: row.creatorName },
      updatedBy: { id: row.editorId, name: row.editorName },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    nextCursor:
      rows.length > limit && last
        ? encodeCursor({
            date: last.date,
            createdAt: last.cursorTime,
            id: last.id,
          })
        : null,
  };
}

const totalsColumns = {
  income:
    sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'income'), 0)`.mapWith(
      Number,
    ),
  expense:
    sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'expense'), 0)`.mapWith(
      Number,
    ),
  count: sql<number>`count(*)`.mapWith(Number),
};

/**
 * Income, expense and count of the transactions matching the filters (a month: the month's
 * totals). Summed in Postgres; transfers count in neither total.
 */
export async function transactionTotals(
  filters: TransactionFilters,
): Promise<TransactionTotals> {
  const [row] = await db
    .select(totalsColumns)
    .from(transactions)
    .where(filterConditions(filters));
  return row ?? { income: 0, expense: 0, count: 0 };
}

/** The same totals per day, newest first, for the list's day headers. */
export async function transactionDayTotals(
  filters: TransactionFilters,
): Promise<TransactionDayTotal[]> {
  return db
    .select({ date: transactions.date, ...totalsColumns })
    .from(transactions)
    .where(filterConditions(filters))
    .groupBy(transactions.date)
    .orderBy(desc(transactions.date));
}

/** Whether the book has any transaction at all (for the first-run empty state). */
export async function bookHasTransactions(): Promise<boolean> {
  const [row] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .limit(1);
  return row !== undefined;
}

/** Tags in the book, most used first, for suggestions and the tag filter. */
export async function listTransactionTags(): Promise<string[]> {
  const rows = await db.execute<{ tag: string }>(sql`
    select tag from ${transactions}, unnest(${transactions.tags}) as tag
    group by tag
    order by count(*) desc, tag
    limit ${TRANSACTION_TAG_SUGGESTIONS_MAX}
  `);
  return rows.rows.map((row) => row.tag);
}

/** Every account for the form and the filters, in the saved order, archived ones included. */
export async function listAccountOptions(): Promise<AccountOption[]> {
  return db
    .select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      archived: accounts.archived,
    })
    .from(accounts)
    .orderBy(
      asc(accounts.sortOrder),
      asc(accounts.createdAt),
      asc(accounts.id),
    );
}

/** What the transaction form and the filters choose from: accounts, categories and tags. */
export async function listTransactionOptions(): Promise<TransactionOptions> {
  const [accountOptions, categoryTree, tags] = await Promise.all([
    listAccountOptions(),
    listCategories(),
    listTransactionTags(),
  ]);
  return { accounts: accountOptions, categories: categoryTree, tags };
}

/** The fields a transaction stores, as the form edits them (for undo and edit checks). */
export async function getTransactionInput(
  id: string,
): Promise<(TransactionInput & { source: TransactionSource }) | null> {
  const [row] = await db
    .select({
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
      categoryId: transactions.categoryId,
      description: transactions.description,
      note: transactions.note,
      tags: transactions.tags,
      source: transactions.source,
    })
    .from(transactions)
    .where(eq(transactions.id, id));
  return row ?? null;
}

/** Problems with the accounts and category a transaction points to. */
export type ReferenceError =
  "accountUnavailable" | "toAccountUnavailable" | "categoryUnavailable";

/**
 * Checks that the accounts and the category exist, aren't archived and the category has the
 * transaction's type. An edit may keep the archived account or category it already had.
 * Returns the first problem, or null.
 */
export async function checkTransactionReferences(
  input: TransactionInput,
  current?: TransactionInput | null,
): Promise<ReferenceError | null> {
  const accountIds = [input.accountId, input.toAccountId].filter(
    (id): id is string => id !== null,
  );
  const [accountRows, categoryRows] = await Promise.all([
    db
      .select({ id: accounts.id, archived: accounts.archived })
      .from(accounts)
      .where(inArray(accounts.id, accountIds)),
    input.categoryId
      ? db
          .select({
            type: categories.type,
            archived: categories.archived,
            parentArchived: parent.archived,
          })
          .from(categories)
          .leftJoin(parent, eq(parent.id, categories.parentId))
          .where(eq(categories.id, input.categoryId))
      : Promise.resolve([]),
  ]);

  const kept = new Set(
    [current?.accountId, current?.toAccountId].filter(Boolean),
  );
  const usable = (id: string) => {
    const row = accountRows.find((account) => account.id === id);
    return row !== undefined && (!row.archived || kept.has(id));
  };
  if (!usable(input.accountId)) return "accountUnavailable";
  if (input.toAccountId && !usable(input.toAccountId)) {
    return "toAccountUnavailable";
  }
  if (input.categoryId) {
    const [category] = categoryRows;
    if (!category || category.type !== input.type) return "categoryUnavailable";
    const archived = category.archived || category.parentArchived === true;
    if (archived && current?.categoryId !== input.categoryId) {
      return "categoryUnavailable";
    }
  }
  return null;
}

/** Adds a transaction. Returns its id. */
export async function createTransaction(
  input: TransactionInput,
  actorId: string,
  source: TransactionSource,
): Promise<string> {
  const [row] = await db
    .insert(transactions)
    .values({ ...input, source, createdBy: actorId, updatedBy: actorId })
    .returning({ id: transactions.id });
  if (!row) throw new Error("The transaction wasn’t saved.");
  return row.id;
}

/** Changes a transaction. Returns false when there is no such transaction. */
export async function updateTransaction(
  id: string,
  input: TransactionInput,
  actorId: string,
): Promise<boolean> {
  const rows = await db
    .update(transactions)
    .set({ ...input, updatedBy: actorId })
    .where(eq(transactions.id, id))
    .returning({ id: transactions.id });
  return rows.length > 0;
}

/**
 * Deletes a transaction. Returns what it stored (so it can be added again for undo), or null
 * when there was no such transaction.
 */
export async function deleteTransaction(
  id: string,
): Promise<TransactionInput | null> {
  const [row] = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning({
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      accountId: transactions.accountId,
      toAccountId: transactions.toAccountId,
      categoryId: transactions.categoryId,
      description: transactions.description,
      note: transactions.note,
      tags: transactions.tags,
    });
  return row ?? null;
}

/** Adds several transactions in one statement (all or none). Returns their ids, in order. */
export async function createTransactions(
  inputs: TransactionInput[],
  actorId: string,
  source: TransactionSource,
): Promise<string[]> {
  if (inputs.length === 0) return [];
  const rows = await db
    .insert(transactions)
    .values(
      inputs.map((input) => ({
        ...input,
        source,
        createdBy: actorId,
        updatedBy: actorId,
      })),
    )
    .returning({ id: transactions.id });
  return rows.map((row) => row.id);
}

/** A stored transaction's fields with its id. */
export type StoredTransaction = TransactionInput & { id: string };

const storedColumns = {
  id: transactions.id,
  type: transactions.type,
  amount: transactions.amount,
  date: transactions.date,
  accountId: transactions.accountId,
  toAccountId: transactions.toAccountId,
  categoryId: transactions.categoryId,
  description: transactions.description,
  note: transactions.note,
  tags: transactions.tags,
};

/**
 * Transactions that look like the given ones: the same date, account, amount and type. Used to
 * warn about possible duplicates before adding (a bank SMS sent twice).
 */
export async function findSimilarTransactions(
  inputs: Pick<TransactionInput, "date" | "accountId" | "amount" | "type">[],
): Promise<StoredTransaction[]> {
  if (inputs.length === 0) return [];
  const keys = sql.join(
    inputs.map(
      (input) =>
        sql`(${input.date}::date, ${input.accountId}::uuid, ${input.amount}::bigint, ${input.type}::text)`,
    ),
    sql`, `,
  );
  return db
    .select(storedColumns)
    .from(transactions)
    .where(
      sql`(${transactions.date}, ${transactions.accountId}, ${transactions.amount}, ${transactions.type}) in (${keys})`,
    )
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
}

/** Deletes several transactions. Returns the ones that existed, with what they stored. */
export async function deleteTransactions(
  ids: string[],
): Promise<StoredTransaction[]> {
  if (ids.length === 0) return [];
  return db
    .delete(transactions)
    .where(inArray(transactions.id, ids))
    .returning(storedColumns);
}
