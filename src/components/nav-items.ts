export type NavKey = 'dashboard' | 'transactions' | 'reports' | 'budgets';

export const NAV_ICON_PATHS: Record<NavKey, string> = {
  dashboard:
    'M2.5 2.5h6.2v6.2H2.5V2.5zM11.3 2.5h6.2v6.2h-6.2V2.5zM2.5 11.3h6.2v6.2H2.5v-6.2zM11.3 11.3h6.2v6.2h-6.2v-6.2z',
  transactions: 'M3 5h14M3 10h14M3 15h9',
  reports: 'M4 16V9M10 16V4M16 16v-6',
  budgets: 'M10 3a7 7 0 100 14 7 7 0 000-14zM10 7a3 3 0 100 6 3 3 0 000-6z',
};

export const NAV_ITEMS: { to: string; key: NavKey }[] = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/transactions', key: 'transactions' },
  { to: '/reports', key: 'reports' },
  { to: '/budgets', key: 'budgets' },
];
