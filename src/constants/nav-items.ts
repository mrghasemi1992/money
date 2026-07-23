export type NavKey = 'dashboard' | 'transactions' | 'reports' | 'budgets';

export const NAV_ITEMS: { to: string; key: NavKey }[] = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/transactions', key: 'transactions' },
  { to: '/reports', key: 'reports' },
  { to: '/budgets', key: 'budgets' },
];
