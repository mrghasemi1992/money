import {
  ChartPieIcon,
  HandCoinsIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SettingsIcon,
  TagsIcon,
  TargetIcon,
} from "lucide-react";

import type { NavItem } from "@/types/navigation";

/**
 * The app's sections, in the order the sidebar lists them: the main pages, a line, the book's
 * accounts and categories. Settings (`app`) isn't in the sidebar's list or the «More» menu: it
 * is in the user menu, beside signing out, and stays here for the page title. The mobile bottom
 * bar shows the `tab` ones; the rest are behind its «More» tab, in the same order and groups.
 * Filter with getNavItems() (src/helpers/navigation.ts), which drops `adminOnly` items for
 * other roles, then getPhoneTabs() and getMoreItems(). User management is a settings subpage
 * (/settings/users), not a section.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "dashboard",
    href: "/",
    icon: LayoutDashboardIcon,
    group: "main",
    tab: true,
  },
  {
    label: "transactions",
    href: "/transactions",
    icon: ReceiptTextIcon,
    group: "main",
    tab: true,
  },
  {
    label: "budgets",
    href: "/budgets",
    icon: TargetIcon,
    group: "main",
  },
  { label: "debts", href: "/debts", icon: HandCoinsIcon, group: "main" },
  {
    label: "reports",
    href: "/reports",
    icon: ChartPieIcon,
    group: "main",
    tab: true,
    tabs: ["/reports/breakdown", "/reports/trends"],
  },
  { label: "accounts", href: "/accounts", icon: LandmarkIcon, group: "book" },
  { label: "categories", href: "/categories", icon: TagsIcon, group: "book" },
  {
    label: "settings",
    href: "/settings",
    icon: SettingsIcon,
    group: "app",
  },
];
