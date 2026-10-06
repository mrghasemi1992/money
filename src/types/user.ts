import type { USER_ROLES } from "@/constants/user";

import type { Locale } from "./locale";

export type UserRole = (typeof USER_ROLES)[number];

/** The fields of the change-password form, for errors that belong to one of them. */
export type PasswordField = "current" | "new" | "repeat";

/** A user as the user management page lists them. */
export type ManagedUser = {
  id: string;
  /** Display name. */
  name: string;
  /** As it was typed when the user was created. */
  username: string;
  role: UserRole;
  locale: Locale;
  /** Banned in Better Auth: can't sign in. */
  disabled: boolean;
  /** The day the account was created, as an ISO date in the viewer's time zone. */
  createdOn: string;
};

/** What an admin enters to create a user. The calendar follows the language. */
export type NewUserInput = {
  name: string;
  username: string;
  /** The temporary password, given to the user by the admin. */
  password: string;
  role: UserRole;
  locale: Locale;
};

/** The fields of the new-user form, for errors that belong to one of them. */
export type NewUserField = "name" | "username" | "password";
