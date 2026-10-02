import { type SQL, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  foreignKey,
  index,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { CATEGORY_COLORS, CATEGORY_TYPES } from "@/constants/category";

import { id, oneOf, timestamps } from "./columns";

/**
 * Income and expense categories, with one optional level of subcategories.
 *
 * The rules are enforced by the database, not only by the app:
 * - A subcategory has the same type as its parent: the (parent_id, type) foreign key.
 * - Only one level: `has_parent` (true on subcategories) must match the parent's
 *   `is_top_level`, so a subcategory can't be a parent, and a category with subcategories
 *   can't become a subcategory.
 */
export const categories = pgTable(
  "categories",
  {
    id: id(),
    type: text({ enum: CATEGORY_TYPES }).notNull(),
    name: text().notNull(),
    color: text({ enum: CATEGORY_COLORS }).notNull(),
    /** Null for a category, set for a subcategory. */
    parentId: uuid(),
    archived: boolean().notNull().default(false),
    isTopLevel: boolean()
      .notNull()
      .generatedAlwaysAs((): SQL => sql`${categories.parentId} is null`),
    hasParent: boolean()
      .notNull()
      .generatedAlwaysAs((): SQL => sql`${categories.parentId} is not null`),
    ...timestamps(),
  },
  (table) => [
    check("categories_type_check", oneOf(table.type, CATEGORY_TYPES)),
    check("categories_color_check", oneOf(table.color, CATEGORY_COLORS)),
    check(
      "categories_parent_check",
      sql`${table.parentId} is null or ${table.parentId} <> ${table.id}`,
    ),
    index().on(table.parentId),
    unique("categories_name_unique")
      .on(table.type, table.parentId, table.name)
      .nullsNotDistinct(),
    // Targets of the foreign keys below and in transactions and budgets.
    unique("categories_id_type_unique").on(table.id, table.type),
    unique("categories_id_type_top_level_unique").on(
      table.id,
      table.type,
      table.isTopLevel,
    ),
    foreignKey({
      name: "categories_parent_fk",
      columns: [table.parentId, table.type, table.hasParent],
      foreignColumns: [table.id, table.type, table.isTopLevel] as [
        AnyPgColumn,
        AnyPgColumn,
        AnyPgColumn,
      ],
    }),
  ],
);
