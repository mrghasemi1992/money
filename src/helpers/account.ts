import { z } from "zod";

import { ACCOUNT_NAME_MAX_LENGTH, ACCOUNT_TYPES } from "@/constants/account";
import { checkIdentifierValue } from "@/helpers/account-identifier";
import type { AccountIdentifierError } from "@/helpers/account-identifier";
import type {
  AccountField,
  AccountInput,
  AccountIdentifierKind,
  AccountKind,
  AccountType,
} from "@/types/account";
import { tidyName } from "@/utils/text";

/** One identifier field of the account form: optional, checked and normalized per kind. */
function identifierField(kind: AccountIdentifierKind) {
  return z
    .string()
    .max(100)
    .nullable()
    .transform((raw, context) => {
      const checked = checkIdentifierValue(kind, raw);
      if (!checked.ok) {
        context.addIssue({ code: "custom", message: checked.error });
        return z.NEVER;
      }
      return checked.value;
    });
}

/**
 * The account form's rules, shared by the form (to show errors before sending) and the Server
 * Actions (which check again). Name messages are keys of `accounts.form.errors`.
 */
export const accountSchema = z.object({
  name: z
    .string()
    .transform(tidyName)
    .pipe(
      z
        .string()
        .min(1, "nameMissing")
        .max(ACCOUNT_NAME_MAX_LENGTH, "nameTooLong"),
    ),
  type: z.enum(ACCOUNT_TYPES),
  identifiers: z.object({
    accountNumber: identifierField("accountNumber"),
    cardNumber: identifierField("cardNumber"),
    sheba: identifierField("sheba"),
  }),
  openingBalance: z.number().int().safe(),
}) satisfies z.ZodType<AccountInput>;

/** Keys of the `accounts.form.errors` messages. */
export type AccountNameError = "nameMissing" | "nameTooLong" | "nameTaken";

/** An account form problem: the field it belongs to and the message key. */
export type AccountFormError =
  | { field: "name"; key: AccountNameError }
  | { field: Exclude<AccountField, "name">; key: AccountIdentifierError };

/** The form's first problem (the name's before the identifiers'), or null when it is valid. */
export function accountFormError(input: unknown): AccountFormError | null {
  const parsed = accountSchema.safeParse(input);
  if (parsed.success) return null;
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    const key = issue.message;
    if (field === "name" && (key === "nameMissing" || key === "nameTooLong")) {
      return { field, key };
    }
  }
  for (const issue of parsed.error.issues) {
    const key = issue.message;
    const field = issue.path[1];
    if (
      issue.path[0] === "identifiers" &&
      (field === "accountNumber" ||
        field === "cardNumber" ||
        field === "sheba") &&
      (key === "accountNumberInvalid" ||
        key === "cardNumberInvalid" ||
        key === "shebaInvalid")
    ) {
      return { field, key };
    }
  }
  return null;
}

/** The page an account of this type belongs to: /debts for a counterparty, /accounts otherwise. */
export function accountKind(type: AccountType): AccountKind {
  return type === "counterparty" ? "counterparty" : "money";
}

/** Whether an account is a person or lender money is owed to or by (#47). */
export function isCounterparty(account: { type: AccountType }): boolean {
  return account.type === "counterparty";
}

/**
 * What a counterparty's balance means: they owe the book (positive), the book owes them
 * (negative) or nothing is owed.
 */
export function debtStatus(balance: number): "owesYou" | "youOwe" | "settled" {
  if (balance > 0) return "owesYou";
  if (balance < 0) return "youOwe";
  return "settled";
}

/**
 * Totals of the counterparties' balances: what is owed to the book (the positive ones), what
 * it owes (the negative ones, as a positive amount) and the net. The balances come from SQL.
 */
export function debtTotals(balances: number[]): {
  owedToYou: number;
  youOwe: number;
  net: number;
} {
  let owedToYou = 0;
  let youOwe = 0;
  for (const balance of balances) {
    if (balance > 0) owedToYou += balance;
    else youOwe -= balance;
  }
  return { owedToYou, youOwe, net: owedToYou - youOwe };
}
