import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

/** The app's sections; each one's label is the `nav` message with this key. */
export type NavKey =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "reports"
  | "accounts"
  | "debts"
  | "categories"
  | "settings";

/**
 * Where a section sits: the main pages (loans and debts among them), the book's setup
 * (accounts, categories) or the app's own pages (settings, at the bottom of the sidebar).
 */
export type NavGroup = "main" | "book" | "app";

export type NavItem = {
  /** Message key in `nav`: the link's label and the page title. */
  label: NavKey;
  href: Route;
  icon: LucideIcon;
  group: NavGroup;
  /** A main page with its own tab in the mobile bottom bar. The other sections are behind its «More» tab. */
  tab?: boolean;
  /**
   * Pages under it that are its tabs, not subpages (/reports/breakdown): the phone's top bar
   * gives them no back button.
   */
  tabs?: readonly Route[];
  /** Only admins see it. The page itself checks the role with requireAdmin(). */
  adminOnly?: boolean;
};
