import type { AccountType } from "@/types/account";

/**
 * Kinds of account, in the order the form lists them. Stored as text in `accounts.type`; only
 * the icon (ACCOUNT_TYPE_ICONS) and the label (`accounts.types` messages) depend on it.
 */
export const ACCOUNT_TYPES = ["card", "cash", "other"] as const;

export const DEFAULT_ACCOUNT_TYPE: AccountType = "card";

/** Account names appear in forms, lists and reports; long ones are cut off with an ellipsis. */
export const ACCOUNT_NAME_MAX_LENGTH = 50;
