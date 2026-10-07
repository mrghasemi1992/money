import { z } from "zod";

import {
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
  TRANSACTION_NOTE_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TAGS_MAX,
  TRANSACTION_TYPES,
  UNKNOWN_DESCRIPTION,
} from "@/constants/transaction";
import type { TransactionInput } from "@/types/transaction";
import { isIsoDate } from "@/utils/iso-date";
import { tidyName } from "@/utils/text";

/** Fields of the transaction form, as errors point at them. */
export type TransactionField =
  | "amount"
  | "date"
  | "accountId"
  | "toAccountId"
  | "categoryId"
  | "description"
  | "note"
  | "tags";

/** Keys of the `transactions.form.errors` messages. */
export type TransactionError =
  | "amountMissing"
  | "amountTooLarge"
  | "dateMissing"
  | "dateFuture"
  | "accountMissing"
  | "accountUnavailable"
  | "toAccountMissing"
  | "toAccountUnavailable"
  | "sameAccount"
  | "categoryMissing"
  | "categoryUnavailable"
  | "descriptionTooLong"
  | "noteTooLong"
  | "tagTooLong"
  | "tooManyTags";

/** Drops repeated tags, keeping the first of each in its place. */
function uniqueTags(tags: string[]): string[] {
  return [...new Set(tags)];
}

/** Whether a description marks a transaction that still needs to be identified. */
export function isUnknownDescription(description: string): boolean {
  const tidy = description.trim();
  return tidy === "" || tidy === UNKNOWN_DESCRIPTION || tidy === "?";
}

/**
 * The rules between fields: a transfer needs a different destination account, income and
 * expense a category. Null when they hold.
 */
function crossFieldError(value: {
  type?: unknown;
  accountId?: unknown;
  toAccountId?: unknown;
  categoryId?: unknown;
}): { path: [TransactionField]; message: TransactionError } | null {
  if (value.type === "transfer") {
    if (!value.toAccountId) {
      return { path: ["toAccountId"], message: "toAccountMissing" };
    }
    if (value.toAccountId === value.accountId) {
      return { path: ["toAccountId"], message: "sameAccount" };
    }
    return null;
  }
  return value.categoryId
    ? null
    : { path: ["categoryId"], message: "categoryMissing" };
}

/**
 * The transaction form's rules, shared by the form (errors before sending) and the Server
 * Actions (which check again, then check the account and category in the database). `today`
 * is the viewer's today: dates can't be in the future. Messages are `TransactionError` keys.
 *
 * The output is ready to save: names tidied, an empty description becomes «؟», a transfer
 * has no category and income or expense no destination account.
 */
export function transactionSchema(today: string) {
  return z
    .object({
      type: z.enum(TRANSACTION_TYPES),
      amount: z
        .number({ error: "amountMissing" })
        .int("amountMissing")
        .positive("amountMissing")
        .max(Number.MAX_SAFE_INTEGER, "amountTooLarge"),
      date: z
        .string({ error: "dateMissing" })
        .refine(isIsoDate, "dateMissing")
        .refine((date) => date <= today, "dateFuture"),
      accountId: z.uuid({ error: "accountMissing" }),
      toAccountId: z.uuid().nullable(),
      categoryId: z.uuid().nullable(),
      description: z
        .string()
        .transform(tidyName)
        .pipe(
          z
            .string()
            .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, "descriptionTooLong"),
        ),
      note: z
        .string()
        .transform((note) => note.trim())
        .pipe(z.string().max(TRANSACTION_NOTE_MAX_LENGTH, "noteTooLong")),
      tags: z
        .array(
          z
            .string()
            .transform(tidyName)
            .pipe(z.string().max(TRANSACTION_TAG_MAX_LENGTH, "tagTooLong")),
        )
        .transform((tags) => uniqueTags(tags.filter(Boolean)))
        .pipe(z.array(z.string()).max(TRANSACTION_TAGS_MAX, "tooManyTags")),
    })
    .superRefine((value, context) => {
      const found = crossFieldError(value);
      if (found) context.addIssue({ code: "custom", ...found });
    })
    .transform((value): TransactionInput => ({
      ...value,
      description: isUnknownDescription(value.description)
        ? UNKNOWN_DESCRIPTION
        : value.description,
      toAccountId: value.type === "transfer" ? value.toAccountId : null,
      categoryId: value.type === "transfer" ? null : value.categoryId,
    }));
}

/** Each field's first problem; empty when the input is valid. */
export function transactionErrors(
  input: unknown,
  today: string,
): Partial<Record<TransactionField, TransactionError>> {
  const parsed = transactionSchema(today).safeParse(input);
  if (parsed.success) return {};
  const errors: Partial<Record<TransactionField, TransactionError>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as TransactionField | undefined;
    if (field && !errors[field]) {
      errors[field] = toTransactionError(field, issue.message);
    }
  }
  // Zod skips the rules between fields while another field is invalid; show them too.
  const crossField =
    typeof input === "object" && input !== null ? crossFieldError(input) : null;
  if (crossField && !errors[crossField.path[0]]) {
    errors[crossField.path[0]] = crossField.message;
  }
  return errors;
}

const ERRORS = new Set<string>([
  "amountMissing",
  "amountTooLarge",
  "dateMissing",
  "dateFuture",
  "accountMissing",
  "toAccountMissing",
  "sameAccount",
  "categoryMissing",
  "descriptionTooLong",
  "noteTooLong",
  "tagTooLong",
  "tooManyTags",
]);

/** Zod's own messages (a wrong type, say) fall back to the field's «missing» error. */
function toTransactionError(
  field: TransactionField,
  message: string,
): TransactionError {
  if (ERRORS.has(message)) return message as TransactionError;
  switch (field) {
    case "amount":
      return "amountMissing";
    case "date":
      return "dateMissing";
    case "toAccountId":
      return "toAccountMissing";
    case "categoryId":
      return "categoryMissing";
    case "description":
      return "descriptionTooLong";
    case "note":
      return "noteTooLong";
    case "tags":
      return "tooManyTags";
    default:
      return "accountMissing";
  }
}

/** The form's order of fields, so the first error gets the focus. */
export const TRANSACTION_FIELDS: TransactionField[] = [
  "amount",
  "date",
  "accountId",
  "toAccountId",
  "categoryId",
  "description",
  "tags",
  "note",
];
