import { bigint, boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

import { id, timestamps } from "./columns";

/**
 * Where money is kept: bank cards, cash, … Part of the one shared book, like every financial
 * table. Balance = opening balance + its transactions.
 */
export const accounts = pgTable("accounts", {
  id: id(),
  name: text().notNull(),
  /**
   * In the book currency's smallest unit (rials, cents), on the day recording starts. May be 0
   * or negative (an overdrawn card).
   */
  openingBalance: bigint({ mode: "number" }).notNull().default(0),
  /** Hidden from forms; keeps its history. */
  archived: boolean().notNull().default(false),
  sortOrder: integer().notNull().default(0),
  ...timestamps(),
});
