import "server-only";

import { sql } from "drizzle-orm";

import type { BookProgress } from "@/types/dashboard";

import { db } from "./index";
import { accounts, categories, oauthConsent, transactions } from "./schema";

/*
 * What the dashboard needs besides the other pages' queries. The page calls requireUser()
 * first.
 */

/**
 * How far the book is set up, in one statement: whether it has accounts, categories and
 * transactions, and whether this user has connected Claude. The dashboard shows its first-run
 * steps until the book has accounts and transactions.
 */
export async function getBookProgress(userId: string): Promise<BookProgress> {
  const result = await db.execute<{
    has_accounts: boolean;
    has_categories: boolean;
    has_transactions: boolean;
    connected: boolean;
  }>(sql`
    select
      exists (select 1 from ${accounts}) as has_accounts,
      exists (select 1 from ${categories}) as has_categories,
      exists (select 1 from ${transactions}) as has_transactions,
      exists (
        select 1 from ${oauthConsent} where ${oauthConsent.userId} = ${userId}::uuid
      ) as connected
  `);
  const row = result.rows[0];
  return {
    hasAccounts: row.has_accounts,
    hasCategories: row.has_categories,
    hasTransactions: row.has_transactions,
    connectedClaude: row.connected,
  };
}
