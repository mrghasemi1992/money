import "server-only";

import { eq, sql } from "drizzle-orm";
import { cache } from "react";

import { BOOK_ID, DEFAULT_BOOK_SETTINGS } from "@/constants/book";
import type { BookSettings } from "@/types/book";
import type { Currency } from "@/types/currency";

import { db } from "./index";
import { accounts, book, budgets, transactions } from "./schema";

/** The book's settings, read once per request. Defaults until an admin saves them. */
export const getBookSettings = cache(async (): Promise<BookSettings> => {
  const [row] = await db
    .select({ currency: book.currency })
    .from(book)
    .where(eq(book.id, BOOK_ID));
  return row ?? DEFAULT_BOOK_SETTINGS;
});

/**
 * SQL condition: the book holds amounts in its currency (a transaction, a budget or an
 * opening balance other than 0). Changing the currency then would reinterpret those numbers.
 */
const holdsAmounts = sql`(
  exists (select 1 from ${transactions})
  or exists (select 1 from ${budgets})
  or exists (select 1 from ${accounts} where ${accounts.openingBalance} <> 0)
)`;

/** Whether the book holds amounts, so its currency can no longer change. */
export async function bookHoldsAmounts(): Promise<boolean> {
  const result = await db.execute<{ holds: boolean }>(
    sql`select ${holdsAmounts} as holds`,
  );
  return result.rows[0]?.holds ?? false;
}

/**
 * Sets the book's currency, creating the book row on first save. One statement, so the check
 * and the write can't be split by a transaction added in between: nothing is written while the
 * book holds amounts. Returns false when it refused. The caller checks who may do this.
 */
export async function setBookCurrency(currency: Currency): Promise<boolean> {
  const result = await db.execute(sql`
    insert into ${book} (id, currency)
    select ${BOOK_ID}, ${currency}
    where not ${holdsAmounts}
    on conflict (id) do update
      set currency = excluded.currency, updated_at = now()
    returning id
  `);
  return result.rows.length > 0;
}
