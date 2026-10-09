import { z } from "zod";

import {
  ACCOUNT_IDENTIFIER_KINDS,
  ACCOUNT_NAME_MAX_LENGTH,
  ACCOUNT_TYPES,
} from "@/constants/account";
import { checkIdentifier } from "@/helpers/account-identifier";
import type { AccountIdentifierError } from "@/helpers/account-identifier";
import type { AccountInput } from "@/types/account";
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
