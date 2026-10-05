import type { USER_ROLES } from "@/constants/user";

export type UserRole = (typeof USER_ROLES)[number];

/** The fields of the change-password form, for errors that belong to one of them. */
export type PasswordField = "current" | "new" | "repeat";
