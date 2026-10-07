import { z } from "zod";

import { ACCOUNT_NAME_MAX_LENGTH, ACCOUNT_TYPES } from "@/constants/account";
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
  openingBalance: z.number().int().safe(),
}) satisfies z.ZodType<AccountInput>;

/** Keys of the `accounts.form.errors` messages. */
export type AccountNameError = "nameMissing" | "nameTooLong" | "nameTaken";

/** The name's first problem, or null when the input is valid. */
export function accountNameError(input: unknown): AccountNameError | null {
  const parsed = accountSchema.safeParse(input);
  if (parsed.success) return null;
  const issue = parsed.error.issues.find((item) => item.path[0] === "name");
  return issue?.message === "nameMissing" || issue?.message === "nameTooLong"
    ? issue.message
    : null;
}
