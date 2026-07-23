import { LayoutDashboard, List, BarChart3, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavKey } from './nav-items';

export const NAV_ICONS: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  transactions: List,
  reports: BarChart3,
  budgets: Target,
};
