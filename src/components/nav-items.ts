import { LayoutDashboard, List, BarChart3, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavKey = 'dashboard' | 'transactions' | 'reports' | 'budgets';

export const NAV_ICONS: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  transactions: List,
  reports: BarChart3,
  budgets: Target,
};

export const NAV_ITEMS: { to: string; key: NavKey }[] = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/transactions', key: 'transactions' },
  { to: '/reports', key: 'reports' },
  { to: '/budgets', key: 'budgets' },
];
