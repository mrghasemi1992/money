import { NAV_ITEMS } from "@/constants/navigation";
import type { NavItem } from "@/types/navigation";
import type { UserRole } from "@/types/user";

import { canManageUsers } from "./role";

/** The sections a role may open: everything, minus user management for non-admins. */
export function getNavItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.adminOnly || canManageUsers(role));
}

/** Whether `href` is the current page or one of its subpages (/settings for /settings/accounts). */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav item of the current page, if it is one of the sections. */
export function findNavItem(
  items: readonly NavItem[],
  pathname: string,
): NavItem | undefined {
  return items.find((item) => isNavItemActive(pathname, item.href));
}
