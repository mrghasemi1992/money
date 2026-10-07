import "server-only";

import { type SQL, sql } from "drizzle-orm";

import { accounts, transactions } from "@/db/schema";

/*
 * Drizzle writes columns without their table in a one-table query («"id"»), and inside these
 * subqueries that would mean the transaction's id. So the account's columns are qualified.
 */
const accountId = sql`${accounts}.${sql.identifier("id")}`;
const openingBalance = sql`${accounts}.${sql.identifier("opening_balance")}`;

/**
 * SQL for an account's current balance, in the book currency's smallest unit:
 *
 *   opening balance + income − expense − transfers out + transfers in
 *
 * Use it in a query that selects from `accounts`. The sum runs in Postgres (indexes on
 * `account_id` and `to_account_id`), so a balance is never added up in JavaScript. Transfers
 * move money between the book's own accounts: they change both balances but are never income
 * or expense.
 */
export function accountBalance(): SQL<number> {
  return sql<number>`(${openingBalance} + coalesce((
    select sum(case
      when t.type = 'income' then t.amount
      when t.type = 'expense' then -t.amount
      when t.type = 'transfer' and t.account_id = ${accountId} then -t.amount
      else t.amount
    end)
    from ${transactions} t
    where t.account_id = ${accountId} or t.to_account_id = ${accountId}
  ), 0))::bigint`.mapWith(Number);
}

/** SQL for how many transactions come from or go to an account. */
export function accountTransactionCount(): SQL<number> {
  return sql<number>`(
    select count(*) from ${transactions} t
    where t.account_id = ${accountId} or t.to_account_id = ${accountId}
  )::int`.mapWith(Number);
}
