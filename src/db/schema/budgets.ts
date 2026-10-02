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

import { user } from "./auth";
import { categories } from "./categories";
import { id, timestamps } from "./columns";

/**
 * A monthly limit for a top-level expense category, repeating every Jalali month.
 * Subcategory spending rolls up into it.
 *
 * `category_type` and `category_is_top_level` are constant columns, so the composite foreign
 * key only accepts a top-level expense category of the same user.
 */
export const budgets = pgTable(
  "budgets",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid().notNull(),
    /** Rial per Jalali month. */
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
    // Also serves lookups by user_id.
    unique("budgets_user_id_category_id_unique").on(
      table.userId,
      table.categoryId,
    ),
    foreignKey({
      name: "budgets_category_fk",
      columns: [
        table.categoryId,
        table.userId,
        table.categoryType,
        table.categoryIsTopLevel,
      ],
      foreignColumns: [
        categories.id,
        categories.userId,
        categories.type,
        categories.isTopLevel,
      ],
    }).onDelete("cascade"),
  ],
);
