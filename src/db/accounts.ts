import "server-only";

import { and, asc, eq, ne, sql } from "drizzle-orm";

import {
  accountBalance,
  accountTransactionCount,
} from "@/helpers/account-balance";
import type { Account, AccountInput } from "@/types/account";

import { isUniqueViolation } from "./errors";
import { db } from "./index";
import { accounts, transactions } from "./schema";

/*
 * Accounts of the shared book. The callers (Server Actions, pages) check the role first; these
 * functions only read and write.
 */

/** Every account, archived ones included, in their saved order, with balances. */
export async function listAccounts(): Promise<Account[]> {
  return db
    .select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      openingBalance: accounts.openingBalance,
      balance: accountBalance(),
      archived: accounts.archived,
      transactionCount: accountTransactionCount(),
    })
    .from(accounts)
    .orderBy(
      asc(accounts.sortOrder),
      asc(accounts.createdAt),
      asc(accounts.id),
    );
}

/** Whether another account has this name, ignoring case. */
export async function accountNameTaken(
  name: string,
  exceptId?: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(sql`lower(${accounts.name})`, name.toLowerCase()),
        exceptId ? ne(accounts.id, exceptId) : undefined,
      ),
    )
    .limit(1);
  return row !== undefined;
}

/**
 * Adds an account at the end of the list. Returns its id, or null when the name was taken in
 * the meantime (the unique index decides).
 */
export async function createAccount(
  input: AccountInput,
): Promise<string | null> {
  try {
    const [row] = await db
      .insert(accounts)
      .values({
        ...input,
        sortOrder: sql`(select coalesce(max(${accounts.sortOrder}), -1) + 1 from ${accounts})`,
      })
      .returning({ id: accounts.id });
    return row?.id ?? null;
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

/**
 * Changes an account's name, type and opening balance. Returns "ok", "missing" (no such
 * account) or "taken" (another account has the name).
 */
export async function updateAccount(
  id: string,
  input: AccountInput,
): Promise<"ok" | "missing" | "taken"> {
  try {
    const rows = await db
      .update(accounts)
      .set(input)
      .where(eq(accounts.id, id))
      .returning({ id: accounts.id });
    return rows.length > 0 ? "ok" : "missing";
  } catch (error) {
    if (isUniqueViolation(error)) return "taken";
    throw error;
  }
}

/** Archives or restores an account. Returns false when there is no such account. */
export async function setAccountArchived(
  id: string,
  archived: boolean,
): Promise<boolean> {
  const rows = await db
    .update(accounts)
    .set({ archived })
    .where(eq(accounts.id, id))
    .returning({ id: accounts.id });
  return rows.length > 0;
}

/**
 * Deletes an account that has no transactions, checked in the same statement. Returns false
 * when nothing was deleted: the account is in use (or gone). The foreign keys refuse it too.
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const rows = await db
    .delete(accounts)
    .where(
      and(
        eq(accounts.id, id),
        sql`not exists (
          select 1 from ${transactions}
          where ${transactions.accountId} = ${id} or ${transactions.toAccountId} = ${id}
        )`,
      ),
    )
    .returning({ id: accounts.id });
  return rows.length > 0;
}

/**
 * Saves a new order: each id gets its position in `ids` as its sort order, in one statement.
 * Accounts that aren't listed (archived ones) keep theirs.
 */
export async function reorderAccounts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const positions = sql.join(
    ids.map((id, index) => sql`(${id}::uuid, ${index}::int)`),
    sql`, `,
  );
  await db.execute(sql`
    update ${accounts}
      set sort_order = positions.sort_order, updated_at = now()
      from (values ${positions}) as positions (id, sort_order)
      where ${accounts.id} = positions.id
  `);
}
