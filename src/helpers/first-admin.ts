import { z } from "zod";

import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@/constants/user";
import type { FirstAdminField } from "@/types/user";

/**
 * The first-admin form's rules (/setup), shared by the form (to show errors before sending)
 * and the createFirstAdmin Server Action (which checks again). Each message is a key of the
 * `setup.errors` messages. Whether the setup code is right only the server can tell.
 */
export const firstAdminSchema = z.object({
  code: z.string().trim().min(1, "codeMissing"),
  name: z
    .string()
    .trim()
    .min(1, "nameMissing")
    .max(DISPLAY_NAME_MAX_LENGTH, "nameTooLong"),
  username: z
    .string()
    .trim()
    .min(1, "usernameMissing")
    .min(USERNAME_MIN_LENGTH, "usernameTooShort")
    .max(USERNAME_MAX_LENGTH, "usernameTooLong")
    .regex(USERNAME_PATTERN, "usernameInvalid"),
  password: z
    .string()
    .min(1, "passwordMissing")
    .min(PASSWORD_MIN_LENGTH, "passwordTooShort")
    .max(PASSWORD_MAX_LENGTH, "passwordTooLong"),
});

export type FirstAdminInput = z.input<typeof firstAdminSchema>;

/** Keys of the `setup.errors` messages that belong to a field. */
export type FirstAdminError =
  | "codeMissing"
  | "codeWrong"
  | "nameMissing"
  | "nameTooLong"
  | "usernameMissing"
  | "usernameTooShort"
  | "usernameTooLong"
  | "usernameInvalid"
  | "passwordMissing"
  | "passwordTooShort"
  | "passwordTooLong";

const FIRST_ADMIN_ERRORS = new Set<string>([
  "codeMissing",
  "codeWrong",
  "nameMissing",
  "nameTooLong",
  "usernameMissing",
  "usernameTooShort",
  "usernameTooLong",
  "usernameInvalid",
  "passwordMissing",
  "passwordTooShort",
  "passwordTooLong",
] satisfies FirstAdminError[]);

function isFirstAdminError(value: string): value is FirstAdminError {
  return FIRST_ADMIN_ERRORS.has(value);
}

/** The fields in the form's order: the first one with an error gets the focus. */
export const FIRST_ADMIN_FIELDS = [
  "code",
  "name",
  "username",
  "password",
] as const satisfies FirstAdminField[];

/** The first problem of each field, or an empty object when the input is valid. */
export function firstAdminErrors(
  input: unknown,
): Partial<Record<FirstAdminField, FirstAdminError>> {
  const parsed = firstAdminSchema.safeParse(input);
  if (parsed.success) return {};
  const errors: Partial<Record<FirstAdminField, FirstAdminError>> = {};
  for (const issue of parsed.error.issues) {
    const field = FIRST_ADMIN_FIELDS.find((name) => name === issue.path[0]);
    if (field && !errors[field] && isFirstAdminError(issue.message)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
