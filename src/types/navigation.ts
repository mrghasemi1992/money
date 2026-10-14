import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

/** The app's sections; each one's label is the `nav` message with this key. */
export type NavKey =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "reports"
  | "accounts"
  | "categories"
  | "settings"
  | "users";

/** Where a section sits: the main pages, the book's setup (accounts, categories) or the app's own pages. */
export type NavGroup = "main" | "book" | "app";

export type NavItem = {
  /** Message key in `nav`: the link's label and the page title. */
  label: NavKey;
  href: Route;
  icon: LucideIcon;
  group: NavGroup;
  /** One of the four main pages: a tab in the mobile bottom bar. The other sections are behind its «More» tab. */
  tab?: boolean;
  /** Only admins see it (user management). The page itself checks the role with requireAdmin(). */
  adminOnly?: boolean;
};
