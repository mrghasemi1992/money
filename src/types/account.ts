import type { ACCOUNT_TYPES } from "@/constants/account";

export type AccountType = (typeof ACCOUNT_TYPES)[number];

/** An account as the accounts page lists it, with its live balance. */
export type Account = {
  id: string;
  name: string;
  type: AccountType;
  /** In the book currency's smallest unit; may be 0 or negative. */
  openingBalance: number;
  /** Opening balance plus the account's transactions (see `accountBalance`). */
  balance: number;
  /** Hidden from forms; keeps its history. */
  archived: boolean;
  /** Transactions from or to this account. Accounts with any can't be deleted. */
  transactionCount: number;
};

/** What the account form edits. */
export type AccountInput = {
  name: string;
  type: AccountType;
  openingBalance: number;
};
