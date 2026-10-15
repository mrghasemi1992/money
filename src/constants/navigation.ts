import {
  ChartPieIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  SettingsIcon,
  TagsIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

import type { NavItem } from "@/types/navigation";

/**
 * The app's sections, in the order the sidebar lists them. The sidebar shows all of them in
 * three groups separated by a line: the main pages, the book's accounts and categories, then
 * settings and user management. The mobile bottom bar shows the `tab` ones; the rest are behind
 * its «More» tab, except the `topBar` ones (settings), which the phone's top bar links to. Filter
 * with getNavItems() (src/helpers/navigation.ts), which drops `adminOnly` items for other roles,
 * then getPhoneTabs() and getMoreItems().
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "dashboard",
    href: "/",
    icon: LayoutDashboardIcon,
    group: "main",
    tab: true,
    shortLabel: "dashboard",
  },
  {
    label: "transactions",
    href: "/transactions",
    icon: ReceiptIcon,
    group: "main",
    tab: true,
    shortLabel: "transactions",
  },
  {
    label: "budgets",
    href: "/budgets",
    icon: TargetIcon,
    group: "main",
  },
  {
    label: "reports",
    href: "/reports",
    icon: ChartPieIcon,
    group: "main",
    tab: true,
  },
  { label: "accounts", href: "/accounts", icon: LandmarkIcon, group: "book" },
  { label: "categories", href: "/categories", icon: TagsIcon, group: "book" },
  {
    label: "settings",
    href: "/settings",
    icon: SettingsIcon,
    group: "app",
    topBar: true,
  },
  {
    label: "users",
    href: "/admin/users",
    icon: UsersIcon,
    group: "app",
    adminOnly: true,
  },
];
