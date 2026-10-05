import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

/** The app's sections; each one's label is the `nav` message with this key. */
export type NavKey =
  "dashboard" | "transactions" | "budgets" | "reports" | "settings" | "users";

export type NavItem = {
  /** Message key in `nav`: the link's label and the page title. */
  label: NavKey;
  href: Route;
  icon: LucideIcon;
  /** One of the four main pages: a tab in the mobile bottom bar. */
  tab?: boolean;
  /** Only admins see it (user management). The page itself checks the role with requireAdmin(). */
  adminOnly?: boolean;
};
