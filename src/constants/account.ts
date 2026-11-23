import type { AccountType } from "@/types/account";

/**
 * Kinds of account. Stored as text in `accounts.type`; the icon (ACCOUNT_TYPE_ICONS), the label
 * (`accounts.types` messages) and whether the account can carry an identifier (`bank` only)
 * depend on it. A `counterparty` is a person or lender money is owed to or by (#47): it lives on
 * /debts, not /accounts, and its balance is what they owe (positive) or are owed (negative).
 */
export const ACCOUNT_TYPES = ["bank", "cash", "other", "counterparty"] as const;

/** The kinds of the book's own money (the /accounts page and its form), in the form's order. */
export const MONEY_ACCOUNT_TYPES = ["bank", "cash", "other"] as const;

export const DEFAULT_ACCOUNT_TYPE: AccountType = "bank";

/**
 * A bank account's optional identifiers, each stored in its own column (`accounts.account_number`,
 * `card_number`, `sheba`) normalized: Latin digits, no spaces; a Sheba with its uppercase «IR».
 */
export const ACCOUNT_IDENTIFIER_KINDS = [
  "accountNumber",
  "cardNumber",
  "sheba",
] as const;

/** A card number is 16 digits. */
export const CARD_NUMBER_LENGTH = 16;
/** A Sheba (Iranian IBAN) is «IR» and 24 digits. */
export const SHEBA_DIGITS_LENGTH = 24;
/** Account numbers differ between banks: digits, with a sensible range (dashes and spaces are dropped). */
export const ACCOUNT_NUMBER_MIN_LENGTH = 5;
export const ACCOUNT_NUMBER_MAX_LENGTH = 30;

/** Account names appear in forms, lists and reports; long ones are cut off with an ellipsis. */
export const ACCOUNT_NAME_MAX_LENGTH = 50;
