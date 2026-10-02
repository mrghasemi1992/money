import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import {
  TRANSACTION_SOURCES,
  TRANSACTION_TYPES,
} from "@/constants/transaction";

import { accounts } from "./accounts";
import { user } from "./auth";
import { categories } from "./categories";
import { id, oneOf, timestamps } from "./columns";

/**
 * Income, expense and transfers between the user's own accounts.
 *
 * Enforced by the database:
 * - The accounts and the category belong to the transaction's user (composite foreign keys
 *   with user_id).
 * - The category's type equals the transaction's type: the (category_id, user_id, type)
 *   foreign key. No category has the type "transfer", so transfers can't have one.
 * - Transfers have a different destination account; income and expense have none.
 */
export const transactions = pgTable(
  "transactions",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text({ enum: TRANSACTION_TYPES }).notNull(),
    /** Gregorian `YYYY-MM-DD`, no time zone. Converted to Jalali only in the UI and MCP. */
    date: date({ mode: "string" }).notNull(),
    /** Rial, always positive; `type` gives the direction. */
    amount: bigint({ mode: "number" }).notNull(),
    accountId: uuid().notNull(),
    /** Transfers only: the account the money goes to. */
    toAccountId: uuid(),
    /** A category or subcategory of the same type. Null for transfers and unsorted ones. */
    categoryId: uuid(),
    /** «؟» or empty marks a transaction that still needs to be identified. */
    description: text().notNull().default(""),
    note: text().notNull().default(""),
    tags: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    source: text({ enum: TRANSACTION_SOURCES }).notNull().default("web"),
    ...timestamps(),
  },
  (table) => [
    check("transactions_type_check", oneOf(table.type, TRANSACTION_TYPES)),
    check(
      "transactions_source_check",
      oneOf(table.source, TRANSACTION_SOURCES),
    ),
    check("transactions_amount_check", sql`${table.amount} > 0`),
    check(
      "transactions_transfer_check",
      sql`case when ${table.type} = 'transfer' then ${table.toAccountId} is not null and ${table.toAccountId} <> ${table.accountId} and ${table.categoryId} is null else ${table.toAccountId} is null end`,
    ),
    index().on(table.userId, table.date),
    index().on(table.accountId),
    index().on(table.toAccountId),
    index().on(table.categoryId),
    foreignKey({
      name: "transactions_account_fk",
      columns: [table.accountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }),
    foreignKey({
      name: "transactions_to_account_fk",
      columns: [table.toAccountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }),
    foreignKey({
      name: "transactions_category_fk",
      columns: [table.categoryId, table.userId, table.type],
      foreignColumns: [categories.id, categories.userId, categories.type],
    }),
  ],
);
