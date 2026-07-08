export interface Dictionary {
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  emptyState: {
    title: string;
    body: string;
    cta: string;
  };
}

export const en: Dictionary = {
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  emptyState: {
    title: 'No transactions yet',
    body: 'Add an account or import a statement — entries will show up here, one ledger line at a time.',
    cta: 'Add a transaction',
  },
};
