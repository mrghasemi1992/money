import { z } from "zod";

import { LOCALES } from "@/constants/locale";
import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_ROLES,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@/constants/user";
import type { NewUserField, NewUserInput } from "@/types/user";

/**
 * The new-user form's rules, shared by the form (to show errors before sending) and the
 * createUser Server Action (which checks again). Each message is a key of the
 * `users.form.errors` messages, so both sides translate it the same way.
 */
export const newUserSchema = z.object({
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
    .min(PASSWORD_MIN_LENGTH, "passwordTooShort")
    .max(PASSWORD_MAX_LENGTH, "passwordTooLong"),
  role: z.enum(USER_ROLES),
  locale: z.enum(LOCALES),
}) satisfies z.ZodType<NewUserInput>;

/** Keys of the `users.form.errors` messages. */
export type NewUserError =
  | "nameMissing"
  | "nameTooLong"
  | "usernameMissing"
  | "usernameTooShort"
  | "usernameTooLong"
  | "usernameInvalid"
  | "usernameTaken"
  | "passwordTooShort"
  | "passwordTooLong";

const NEW_USER_ERRORS = new Set<string>([
  "nameMissing",
  "nameTooLong",
  "usernameMissing",
  "usernameTooShort",
  "usernameTooLong",
  "usernameInvalid",
  "usernameTaken",
  "passwordTooShort",
  "passwordTooLong",
] satisfies NewUserError[]);

function isNewUserError(value: string): value is NewUserError {
  return NEW_USER_ERRORS.has(value);
}

/**
 * The first problem of each field of the new-user form, or an empty object when the input is
 * valid. Role and language come from fixed choices, so they have no messages of their own.
 */
export function newUserErrors(
  input: unknown,
): Partial<Record<NewUserField, NewUserError>> {
  const parsed = newUserSchema.safeParse(input);
  if (parsed.success) return {};
  const errors: Partial<Record<NewUserField, NewUserError>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (field !== "name" && field !== "username" && field !== "password") {
      continue;
    }
    if (!errors[field] && isNewUserError(issue.message)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
