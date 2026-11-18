import { z } from "zod";

import {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_NAME_MAX_LENGTH,
  ACCOUNT_TYPES,
} from "@/constants/account";
import { checkIdentifier } from "@/helpers/account-identifier";
import type { AccountIdentifierError } from "@/helpers/account-identifier";
import type { AccountInput, AccountKind, AccountType } from "@/types/account";
import { isIsoDate } from "@/utils/iso-date";
import { tidyName } from "@/utils/text";

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
  identifier: z
    .object({
      kind: z.enum(ACCOUNT_IDENTIFIER_KINDS),
      value: z.string().max(100),
    })
    .nullable()
    .transform((identifier, context) => {
      const checked = checkIdentifier(identifier);
      if (checked.ok) return checked.identifier;
      context.addIssue({ code: "custom", message: checked.error });
      return z.NEVER;
    }),
  openingBalance: z.number().int().safe(),
  // Counterparties only (the query drops it for the other types).
  openingDate: z.string().refine(isIsoDate).nullable(),
}) satisfies z.ZodType<AccountInput>;

/** Keys of the `accounts.form.errors` messages. */
export type AccountNameError = "nameMissing" | "nameTooLong" | "nameTaken";

/** An account form problem: the field it belongs to and the message key. */
export type AccountFormError =
  | { field: "name"; key: AccountNameError }
  | { field: "identifier"; key: AccountIdentifierError };

/** The form's first problem (the name's before the identifier's), or null when it is valid. */
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
    if (
      issue.path[0] === "identifier" &&
      (key === "accountNumberInvalid" ||
        key === "cardNumberInvalid" ||
        key === "shebaInvalid")
    ) {
      return { field: "identifier", key };
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
