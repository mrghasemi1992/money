import type { UserRole } from "@/types/user";

/**
 * User roles of the Better Auth admin plugin, from most to least access. Everyone works on the
 * same book: admins and editors read and change it, viewers only read it, and only admins
 * manage users. What each role may do is in `src/helpers/role.ts`; the labels are the `role`
 * messages.
 */
export const USER_ROLES = ["admin", "editor", "viewer"] as const;

/** The role new users get unless an admin picks another one. */
export const DEFAULT_USER_ROLE: UserRole = "viewer";

/** Usernames: Latin letters, digits, «.» and «_», as Better Auth's username plugin accepts them. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Display names are shown in menus and reports; long ones are cut off with an ellipsis. */
export const DISPLAY_NAME_MAX_LENGTH = 60;

/**
 * Temporary passwords an admin gives a new user or after a reset: three groups of four
 * characters from an alphabet without look-alikes (no 0/O, 1/l/I), «kT7m-Qx4p-Wz9r». 55
 * characters, 12 picks: about 69 bits. Generated on the server (`generateTemporaryPassword`).
 */
export const TEMPORARY_PASSWORD_ALPHABET =
  "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const TEMPORARY_PASSWORD_GROUPS = 3;
export const TEMPORARY_PASSWORD_GROUP_LENGTH = 4;
