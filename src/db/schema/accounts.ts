import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { id, timestamps } from "./columns";

/** Where money is kept: bank cards, cash, … Balance = opening balance + its transactions. */
export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    /** Rial, on the day the user starts recording. May be 0 or negative (an overdrawn card). */
    openingBalance: bigint({ mode: "number" }).notNull().default(0),
    /** Hidden from forms; keeps its history. */
    archived: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index().on(table.userId),
    // Target of the (account_id, user_id) foreign keys, so a transaction can only use an
    // account of its own user.
    unique("accounts_id_user_id_unique").on(table.id, table.userId),
  ],
);
