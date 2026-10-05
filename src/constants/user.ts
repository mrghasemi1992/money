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
