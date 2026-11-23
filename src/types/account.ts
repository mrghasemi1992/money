import type {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_TYPES,
} from "@/constants/account";

export type AccountType = (typeof ACCOUNT_TYPES)[number];

/**
 * Which page an account belongs to: the book's own money (/accounts) or the people and lenders
 * money is owed to or by (/debts, type `counterparty`).
 */
export type AccountKind = "money" | "counterparty";

export type AccountIdentifierKind = (typeof ACCOUNT_IDENTIFIER_KINDS)[number];

/**
 * A bank account's optional identifiers, as stored (normalized). One account can carry all
 * three; every kind is null for cash, other and counterparty accounts.
 */
export type AccountIdentifiers = {
  accountNumber: string | null;
  cardNumber: string | null;
  sheba: string | null;
};

/** An account as the accounts page lists it, with its live balance. */
export type Account = {
  id: string;
  name: string;
  type: AccountType;
  /** Account number, card number and Sheba; bank accounts only. Show them masked in lists. */
  identifiers: AccountIdentifiers;
  /** In the book currency's smallest unit; may be 0 or negative. */
  openingBalance: number;
  /** Opening balance plus the account's transactions (see `accountBalance`). */
  balance: number;
  /** Hidden from forms; keeps its history. */
  archived: boolean;
  /** Transactions from or to this account. Accounts with any can't be deleted. */
  transactionCount: number;
  /** The date of its oldest transaction, for a link to all of them; null without any. */
  firstDate: string | null;
};

/** Fields of the account form an error can belong to. */
export type AccountField = "name" | "accountNumber" | "cardNumber" | "sheba";

/** What the account form edits. */
export type AccountInput = {
  name: string;
  type: AccountType;
  /** Typed as the user wrote it; the server normalizes and checks each kind. */
  identifiers: AccountIdentifiers;
  /** Always 0 for a counterparty (its debts are receivable / payable transactions). */
  openingBalance: number;
};
