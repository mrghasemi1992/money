import { USER_ROLES } from "@/constants/user";
import type { UserRole } from "@/types/user";

/**
 * What each role may do. Pure functions, so server checks (`src/auth/session.ts`, MCP tools)
 * and the UI (hiding write controls) share the same rules. The server check is what counts.
 */

/**
 * The role stored on a user. Better Auth types it as a plain string; anything that isn't one
 * of Money's roles counts as the one with the least access.
 */
export function toUserRole(value: string | null | undefined): UserRole {
  return USER_ROLES.find((role) => role === value) ?? "viewer";
}

/** Create, edit and delete transactions, accounts, categories and budgets; import CSV. */
export function canWrite(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

/** Create users, reset passwords, disable users and change roles. */
export function canManageUsers(role: UserRole): boolean {
  return role === "admin";
}
