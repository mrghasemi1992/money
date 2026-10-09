import type {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_TYPES,
} from "@/constants/account";

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type AccountIdentifierKind = (typeof ACCOUNT_IDENTIFIER_KINDS)[number];

/** An account's optional identifier, as stored (normalized). */
export type AccountIdentifier = {
  kind: AccountIdentifierKind;
  value: string;
};

/** An account as the accounts page lists it, with its live balance. */
export type Account = {
  id: string;
  name: string;
  type: AccountType;
  /** Account number, card number or Sheba; bank accounts only. Show it masked in lists. */
  identifier: AccountIdentifier | null;
  /** In the book currency's smallest unit; may be 0 or negative. */
  openingBalance: number;
  /** Opening balance plus the account's transactions (see `accountBalance`). */
  balance: number;
  /** Hidden from forms; keeps its history. */
  archived: boolean;
  /** Transactions from or to this account. Accounts with any can't be deleted. */
  transactionCount: number;
};

/** Fields of the account form an error can belong to. */
export type AccountField = "name" | "identifier";

/** What the account form edits. */
export type AccountInput = {
  name: string;
  type: AccountType;
  /** Typed as the user wrote it; the server normalizes and checks it per kind. */
  identifier: AccountIdentifier | null;
  openingBalance: number;
};
