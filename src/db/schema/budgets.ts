import { type SQL, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  foreignKey,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "./categories";
import { id, timestamps } from "./columns";

/**
 * A monthly limit for a top-level expense category, repeating every month of the viewer's
 * calendar (Jalali or Gregorian).
 * Subcategory spending rolls up into it.
 *
 * `category_type` and `category_is_top_level` are constant columns, so the composite foreign
 * key only accepts a top-level expense category.
 */
export const budgets = pgTable(
  "budgets",
  {
    id: id(),
    categoryId: uuid().notNull(),
    /** Per month, in the book currency's smallest unit (rials, cents). */
    amount: bigint({ mode: "number" }).notNull(),
    categoryType: text()
      .notNull()
      .generatedAlwaysAs((): SQL => sql`'expense'`),
    categoryIsTopLevel: boolean()
      .notNull()
      .generatedAlwaysAs((): SQL => sql`true`),
    ...timestamps(),
  },
  (table) => [
    check("budgets_amount_check", sql`${table.amount} > 0`),
    unique("budgets_category_id_unique").on(table.categoryId),
    foreignKey({
      name: "budgets_category_fk",
      columns: [table.categoryId, table.categoryType, table.categoryIsTopLevel],
      foreignColumns: [categories.id, categories.type, categories.isTopLevel],
    }).onDelete("cascade"),
  ],
);
