import { sql } from "drizzle-orm";
import { check, integer, pgTable, text } from "drizzle-orm/pg-core";

import { BOOK_ID, DEFAULT_BOOK_SETTINGS } from "@/constants/book";
import { CURRENCIES } from "@/constants/currency";

import { oneOf, timestamps } from "./columns";

/**
 * Settings of the one shared book, in a single row (id 1). There is no row until an admin
 * first saves the settings; until then the app uses DEFAULT_BOOK_SETTINGS.
 */
export const book = pgTable(
  "book",
  {
    id: integer().primaryKey().default(BOOK_ID),
    /** Every amount in the book is in this currency. Changeable only while the book holds no amounts. */
    currency: text({ enum: CURRENCIES })
      .notNull()
      .default(DEFAULT_BOOK_SETTINGS.currency),
    ...timestamps(),
  },
  (table) => [
    check(
      "book_single_row_check",
      sql`${table.id} = ${sql.raw(String(BOOK_ID))}`,
    ),
    check("book_currency_check", oneOf(table.currency, CURRENCIES)),
  ],
);
