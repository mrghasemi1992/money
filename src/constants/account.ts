import type { AccountType } from "@/types/account";

/**
 * Kinds of account, in the order the form lists them. Stored as text in `accounts.type`; the
 * icon (ACCOUNT_TYPE_ICONS), the label (`accounts.types` messages) and whether the account can
 * carry an identifier (`bank` only) depend on it.
 */
export const ACCOUNT_TYPES = ["bank", "cash", "other"] as const;

export const DEFAULT_ACCOUNT_TYPE: AccountType = "bank";

/**
 * What an account's optional identifier is, stored in `accounts.identifier_kind` next to the
 * normalized `identifier` (Latin digits, no spaces; a Sheba with its uppercase «IR»).
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
