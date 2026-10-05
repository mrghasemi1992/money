import {
  ChartPieIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  SettingsIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

import type { NavItem } from "@/types/navigation";

/**
 * The app's sections, in the order the sidebar lists them. The sidebar shows all of them (the
 * main pages, a line, then settings and user management); the mobile bottom bar shows the
 * `tab` ones, and the mobile top bar and user menu reach the rest. Filter with getNavItems()
 * (src/helpers/navigation.ts), which drops `adminOnly` items for other roles.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "dashboard", href: "/", icon: LayoutDashboardIcon, tab: true },
  {
    label: "transactions",
    href: "/transactions",
    icon: ReceiptIcon,
    tab: true,
  },
  { label: "budgets", href: "/budgets", icon: TargetIcon, tab: true },
  { label: "reports", href: "/reports", icon: ChartPieIcon, tab: true },
  { label: "settings", href: "/settings", icon: SettingsIcon },
  { label: "users", href: "/admin/users", icon: UsersIcon, adminOnly: true },
];
