import "server-only";

import { sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { DEFAULT_ACCOUNT_TYPE } from "@/constants/account";
import { CSV_DUPLICATE_CHUNK, CSV_INSERT_CHUNK } from "@/constants/csv";
import type { DuplicateQuery } from "@/helpers/csv-import";
import type {
  ImportDuplicate,
  ImportRef,
  ImportRow,
  NewImportAccount,
  NewImportCategory,
} from "@/types/csv";

import { isUniqueViolation } from "./errors";
import { db } from "./index";
import { accounts, categories, transactions } from "./schema";
import { findSimilarTransactions } from "./transactions";

/*
 * Saving a CSV import. The Server Action checks the role (requireWrite()) and plans the rows
 * with the book read fresh (helpers/csv-import.ts); these functions only read and write.
 */

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    result.push(items.slice(start, start + size));
  }
  return result;
}

/**
 * Ready rows that look like a transaction the book already has: the same date, account,
 * amount and type (as the Claude connector warns). One match per row, the newest.
 */
export async function findImportDuplicates(
  query: DuplicateQuery,
): Promise<ImportDuplicate[]> {
  const stored = (
    await Promise.all(
      chunks(query, CSV_DUPLICATE_CHUNK).map((part) =>
        findSimilarTransactions(part),
      ),
    )
  ).flat();
  const byKey = new Map<string, (typeof stored)[number]>();
  for (const transaction of stored) {
    const key = [
      transaction.date,
      transaction.accountId,
      transaction.amount,
      transaction.type,
    ].join("|");
    if (!byKey.has(key)) byKey.set(key, transaction);
  }
  return query.flatMap((row) => {
    const match = byKey.get(
      [row.date, row.accountId, row.amount, row.type].join("|"),
    );
    return match
      ? [
          {
            line: row.line,
            date: match.date,
            accountId: match.accountId,
            description: match.description,
          },
        ]
      : [];
  });
}

/**
 * Adds an import in one database transaction (one batch): the new accounts (at the end of the
 * list, opening balance 0), the new categories and subcategories, then the rows, in the file's
 * order (`created_at` grows by a microsecond each). source = "csv", created_by and updated_by
 * the importing user. All or nothing: returns "taken" when a new name was taken in the
 * meantime (the unique indexes decide), and nothing is saved.
 */
export async function saveImport(
  plan: {
    rows: ImportRow[];
    accounts: NewImportAccount[];
    categories: NewImportCategory[];
  },
  actorId: string,
): Promise<"ok" | "taken"> {
  if (plan.rows.length === 0) return "ok";
  const ids = new Map<string, string>();
  for (const item of [...plan.accounts, ...plan.categories]) {
    ids.set(item.key, crypto.randomUUID());
  }
  const idOf = (ref: ImportRef): string => {
    if (ref.kind === "existing") return ref.id;
    const id = ids.get(ref.key);
    if (!id) throw new Error(`No new item for ${ref.key}.`);
    return id;
  };

  const statements: BatchItem<"pg">[] = [];
  if (plan.accounts.length > 0) {
    statements.push(
      db.insert(accounts).values(
        plan.accounts.map((account, index) => ({
          id: idOf({ kind: "new", key: account.key }),
          name: account.name,
          type: DEFAULT_ACCOUNT_TYPE,
          openingBalance: 0,
          sortOrder: sql`(select coalesce(max(${accounts.sortOrder}), -1) + ${index + 1} from ${accounts})`,
        })),
      ),
    );
  }
  // Parents come first in the plan, so a subcategory's parent exists when it is added.
  for (const level of [false, true]) {
    const items = plan.categories.filter(
      (category) => (category.parent !== null) === level,
    );
    if (items.length === 0) continue;
    statements.push(
      db.insert(categories).values(
        items.map((category) => ({
          id: idOf({ kind: "new", key: category.key }),
          type: category.type,
          name: category.name,
          color: category.color,
          parentId: category.parent ? idOf(category.parent) : null,
        })),
      ),
    );
  }
  let position = 0;
  for (const part of chunks(plan.rows, CSV_INSERT_CHUNK)) {
    statements.push(
      db.insert(transactions).values(
        part.map((row) => ({
          type: row.type,
          date: row.date,
          amount: row.amount,
          accountId: idOf(row.account),
          toAccountId: row.toAccount ? idOf(row.toAccount) : null,
          categoryId: row.category ? idOf(row.category) : null,
          description: row.description,
          note: row.note,
          tags: row.tags,
          source: "csv" as const,
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: sql`now() + ${position++} * interval '1 microsecond'`,
          updatedAt: sql`now()`,
        })),
      ),
    );
  }

  const [first, ...rest] = statements;
  if (!first) return "ok";
  try {
    await db.batch([first, ...rest]);
    return "ok";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
}
