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

/** Sections with a shorter label in the phone tab bar: the `nav.short` message with this key. */
export type ShortNavKey = "dashboard" | "transactions";

/** Where a section sits: the main pages, the book's setup (accounts, categories) or the app's own pages. */
export type NavGroup = "main" | "book" | "app";

export type NavItem = {
  /** Message key in `nav`: the link's label and the page title. */
  label: NavKey;
  href: Route;
  icon: LucideIcon;
  group: NavGroup;
  /** The phone tab bar's label when the full one is too long for it («Home» for Dashboard). */
  shortLabel?: ShortNavKey;
  /** A main page with its own tab in the mobile bottom bar. The other sections are behind its «More» tab. */
  tab?: boolean;
  /** On phones the top bar links to it (settings), so the «More» sheet leaves it out. */
  topBar?: boolean;
  /** Only admins see it (user management). The page itself checks the role with requireAdmin(). */
  adminOnly?: boolean;
};
