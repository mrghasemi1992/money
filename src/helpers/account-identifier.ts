import {
  ACCOUNT_NUMBER_MAX_LENGTH,
  ACCOUNT_NUMBER_MIN_LENGTH,
  CARD_NUMBER_LENGTH,
  SHEBA_DIGITS_LENGTH,
} from "@/constants/account";
import type { AccountIdentifierKind } from "@/types/account";
import { toLatinDigits } from "@/utils/number";

/** Keys of the `accounts.form.errors` messages for an identifier. */
export type AccountIdentifierError =
  "accountNumberInvalid" | "cardNumberInvalid" | "shebaInvalid";

const ERRORS: Record<AccountIdentifierKind, AccountIdentifierError> = {
  accountNumber: "accountNumberInvalid",
  cardNumber: "cardNumberInvalid",
  sheba: "shebaInvalid",
};

/** What people type between groups of digits (and ZWNJ), dropped before checking. */
const SEPARATORS = /[\s\-_.‌‍]/g;

/**
 * The identifier the way it is stored: Latin digits, no separators, a Sheba as «IR» + 24
 * digits (the «IR» may be left out or typed in lowercase). Returns null when it doesn't fit
 * its kind; an empty value is the caller's «no identifier».
 */
export function normalizeIdentifier(
  kind: AccountIdentifierKind,
  raw: string,
): string | null {
  const text = toLatinDigits(raw).replace(SEPARATORS, "");
  switch (kind) {
    case "cardNumber":
      return new RegExp(`^\\d{${CARD_NUMBER_LENGTH}}$`).test(text)
        ? text
        : null;
    case "sheba": {
      const digits = text.replace(/^ir/i, "");
      return new RegExp(`^\\d{${SHEBA_DIGITS_LENGTH}}$`).test(digits)
        ? `IR${digits}`
        : null;
    }
    case "accountNumber":
      return new RegExp(
        `^\\d{${ACCOUNT_NUMBER_MIN_LENGTH},${ACCOUNT_NUMBER_MAX_LENGTH}}$`,
      ).test(text)
        ? text
        : null;
  }
}

/**
 * One identifier of an account form, normalized: null when none was typed (a blank value),
 * or the error to show on its field when it doesn't fit its kind.
 */
export function checkIdentifierValue(
  kind: AccountIdentifierKind,
  raw: string | null,
):
  | { ok: true; value: string | null }
  | { ok: false; error: AccountIdentifierError } {
  if (raw === null || raw.trim() === "") return { ok: true, value: null };
  const value = normalizeIdentifier(kind, raw);
  return value === null
    ? { ok: false, error: ERRORS[kind] }
    : { ok: true, value };
}

/** How many trailing characters a masked identifier still shows. */
const VISIBLE_TAIL = 4;

/**
 * The identifier for lists: only its last four characters, «•••• 6219». The whole value is
 * for the edit form; lists, reports and Claude get this.
 */
export function maskIdentifier(value: string): string {
  return `•••• ${value.slice(-VISIBLE_TAIL)}`;
}
