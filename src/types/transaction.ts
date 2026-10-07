import type {
  TRANSACTION_SOURCES,
  TRANSACTION_TYPES,
} from "@/constants/transaction";

import type { AccountType } from "./account";
import type { CalendarSystem } from "./calendar";
import type { CategoryColor, CategoryTree } from "./category";

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

/** What the transaction form saves, after validation (`transactionSchema`). */
export type TransactionInput = {
  type: TransactionType;
  /** In the book currency's smallest unit (rials, cents), always positive. */
  amount: number;
  /** Gregorian ISO date. */
  date: string;
  accountId: string;
  /** Transfers only. */
  toAccountId: string | null;
  /** Income and expense only: a category or subcategory of the same type. */
  categoryId: string | null;
  /** «؟» when it isn't known yet. */
  description: string;
  note: string;
  tags: string[];
};

/** The form's values while editing: the amount may be empty. */
export type TransactionFormValues = Omit<TransactionInput, "amount"> & {
  amount: number | null;
};

/** An account as transactions show it. */
export type TransactionAccount = {
  id: string;
  name: string;
  type: AccountType;
};

/** A transaction as the list and the detail show it. */
export type Transaction = TransactionInput & {
  id: string;
  account: TransactionAccount;
  toAccount: TransactionAccount | null;
  /** The category or subcategory, with its top-level parent's name and color. */
  category: {
    name: string;
    /** Set for a subcategory: the category it belongs to. */
    parentName: string | null;
    color: CategoryColor;
  } | null;
  source: TransactionSource;
  createdBy: { id: string; name: string };
  updatedBy: { id: string; name: string };
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
};

/** The list's filters, with the period already turned into Gregorian dates. */
export type TransactionFilters = {
  /** First and last ISO date; null for an open end. */
  from: string | null;
  to: string | null;
  /** Empty: every type. */
  types: TransactionType[];
  /** From or to this account. */
  accountId: string | null;
  /** A category with its subcategories, or one subcategory. */
  categoryId: string | null;
  tag: string | null;
  /** Searches the description, note, tags and category names. */
  search: string;
  unknownOnly: boolean;
};

/**
 * The filters as the URL keeps them (/transactions?month=1405-07&type=expense): a month of a
 * calendar, or a date range, plus the rest. See helpers/transaction-filters.ts.
 */
export type TransactionFilterParams = Omit<
  TransactionFilters,
  "from" | "to"
> & {
  /** A month of a calendar; null with a range or for the current month. */
  month: { calendar: CalendarSystem; year: number; month: number } | null;
  from: string | null;
  to: string | null;
};

/** Income and expense of the filtered transactions (transfers count in neither). */
export type TransactionTotals = {
  income: number;
  expense: number;
  /** Every filtered transaction, transfers included. */
  count: number;
};

/** One day's totals, for the day headers of the list. */
export type TransactionDayTotal = TransactionTotals & { date: string };

/** One page of the list, newest first; `nextCursor` loads the next one. */
export type TransactionPage = {
  rows: Transaction[];
  nextCursor: string | null;
};

/** An account the form and the filters offer, in the saved order. */
export type AccountOption = {
  id: string;
  name: string;
  type: AccountType;
  archived: boolean;
};

/** What the transaction form and the filters choose from. */
export type TransactionOptions = {
  accounts: AccountOption[];
  categories: CategoryTree;
  /** Tags already in the book, most used first. */
  tags: string[];
};
