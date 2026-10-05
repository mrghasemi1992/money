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
 * Income, expense and transfers between the book's accounts.
 *
 * Enforced by the database:
 * - The category's type equals the transaction's type: the (category_id, type) foreign key.
 *   No category has the type "transfer", so transfers can't have one.
 * - Transfers have a different destination account; income and expense have none.
 */
export const transactions = pgTable(
  "transactions",
  {
    id: id(),
    type: text({ enum: TRANSACTION_TYPES }).notNull(),
    /** Gregorian `YYYY-MM-DD`, no time zone. Converted to the user's calendar only in the UI and MCP. */
    date: date({ mode: "string" }).notNull(),
    /** In the book currency's smallest unit (rials, cents), always positive; `type` gives the direction. */
    amount: bigint({ mode: "number" }).notNull(),
    accountId: uuid()
      .notNull()
      .references(() => accounts.id),
    /** Transfers only: the account the money goes to. */
    toAccountId: uuid().references(() => accounts.id),
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
    /** Who added it (web, MCP or CSV import). Users are disabled, never deleted. */
    createdBy: uuid()
      .notNull()
      .references(() => user.id),
    /** Who changed it last; the creator until someone edits it. */
    updatedBy: uuid()
      .notNull()
      .references(() => user.id),
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
    index().on(table.date),
    index().on(table.accountId),
    index().on(table.toAccountId),
    index().on(table.categoryId),
    foreignKey({
      name: "transactions_category_fk",
      columns: [table.categoryId, table.type],
      foreignColumns: [categories.id, categories.type],
    }),
  ],
);
