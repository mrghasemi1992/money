/** User roles of the Better Auth admin plugin. Admins manage user accounts, never their data. */
export const USER_ROLES = ["admin", "user"] as const;

/** Usernames: Latin letters, digits, «.» and «_», as Better Auth's username plugin accepts them. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
