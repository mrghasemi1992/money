import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  integer,
  pgTable,
  text,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_TYPES,
  DEFAULT_ACCOUNT_TYPE,
} from "@/constants/account";

import { id, oneOf, timestamps } from "./columns";

/**
 * Where money is kept: bank cards, cash, … and the people and lenders money is owed to or by
 * (type `counterparty`, #47). Part of the one shared book, like every financial table.
 * Balance = opening balance + its transactions (`accountBalance`); a counterparty's is what
 * they owe the book (positive) or the book owes them (negative). A counterparty's opening
 * balance is always 0: a debt from before the book is a dated `receivable` or `payable`.
 */
export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    /** Unique, ignoring case. */
    name: text().notNull(),
    /** Decides the icon and label (bank account, cash or other); only bank accounts have an identifier. */
    type: text({ enum: ACCOUNT_TYPES }).notNull().default(DEFAULT_ACCOUNT_TYPE),
    /** What `identifier` is: both are set or both null (see `accountIdentifier` rules). */
    identifierKind: text({ enum: ACCOUNT_IDENTIFIER_KINDS }),
    /** Optional account number, card number or Sheba, normalized (Latin digits, «IR» uppercase). */
    identifier: text(),
    /**
     * In the book currency's smallest unit (rials, cents), on the day recording starts. May be 0
     * or negative (an overdrawn card).
     */
    openingBalance: bigint({ mode: "number" }).notNull().default(0),
    /** Hidden from forms; keeps its history. */
    archived: boolean().notNull().default(false),
    /** Position in lists and forms, from 0. Archived accounts keep theirs. */
    sortOrder: integer().notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    check("accounts_type_check", oneOf(table.type, ACCOUNT_TYPES)),
    check(
      "accounts_identifier_check",
      sql`(${table.identifierKind} is null and ${table.identifier} is null) or (${table.type} = 'bank' and ${table.identifier} is not null and ${table.identifierKind} in (${sql.raw(ACCOUNT_IDENTIFIER_KINDS.map((kind) => `'${kind}'`).join(", "))}))`,
    ),
    uniqueIndex("accounts_name_unique").on(sql`lower(${table.name})`),
    // A counterparty's debts are dated receivable / payable transactions, not an opening balance.
    check(
      "accounts_counterparty_opening_check",
      sql`${table.type} <> 'counterparty' or ${table.openingBalance} = 0`,
    ),
    // The target of transactions_debt_account_fk: receivables and payables are on counterparties.
    unique("accounts_id_type_unique").on(table.id, table.type),
  ],
);
