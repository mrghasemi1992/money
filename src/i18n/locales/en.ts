import type { Dictionary } from '@/i18n/types';

export const en: Dictionary = {
  brand: 'Settle',
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  nav: {
    primaryLabel: 'Primary',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    reports: 'Reports',
    budgets: 'Budgets',
    addTransaction: 'Add transaction',
    collapseNavigation: 'Collapse navigation',
    expandNavigation: 'Expand navigation',
    skipToContent: 'Skip to content',
    language: 'Language',
    theme: 'Theme',
    route: 'Route',
    placeholderText: 'Page content renders here',
  },
  emptyState: {
    title: 'No transactions yet',
    body: 'Add an account or import a statement — entries will show up here, one ledger line at a time.',
    cta: 'Add a transaction',
  },
  designSystem: {
    eyebrow: 'Settle',
    title: 'Design system',
    lede: 'The tokens and base primitives for a local-first ledger app — the single reference every screen is built from.',
    color: {
      title: 'Color',
      neutralLabels: {
        bg: 'bg',
        surface: 'surface',
        border: 'border',
        mutedText: 'muted text',
        text: 'text',
      },
      accentLabel: 'Brass — accent',
      negativeLabel: 'Rust — negative',
      description:
        'Positive amounts carry no dedicated hue — body text color plus a "+" prefix only. Category badges never reuse the Rust hue, so a category tag never reads as "this is a loss".',
      testBadge: 'Test',
    },
    type: {
      title: 'Type',
      displayLabel: 'Display · 600 · 34/1.15',
      bodyLabel: 'Body · 400 · 16/1.55',
      numericLabel: 'Numeric · 500 · tabular-nums',
      captionLabel: 'Caption · 400 · 13/1.4',
      withoutTabular: 'without tabular-nums',
      withTabular: 'with tabular-nums',
    },
    spacing: {
      title: 'Spacing & radius',
    },
    elevation: {
      title: 'Elevation',
    },
    button: {
      title: 'Button',
      primary: 'Primary',
      secondary: 'Secondary',
      ghost: 'Ghost',
      destructive: 'Destructive',
      disabledSuffix: ' — disabled',
    },
    input: {
      title: 'Input',
      accountName: 'Account name',
      accountPlaceholder: 'Checking — main',
      accountHint: 'Shown on statements and exports.',
      openingBalance: 'Opening balance',
      openingError: 'Enter a valid number.',
      currency: 'Currency',
    },
    card: {
      title: 'Card',
      defaultLabel: 'Default',
      interactiveLabel: 'Interactive',
      cardTitle: 'Monthly rent',
      cardBody: 'Auto-paid on the 1st',
    },
    table: {
      title: 'Table row — transaction',
      descriptionBefore: 'The amount column uses ',
      descriptionCode: 'text-align: end',
      descriptionAfter:
        ', not left/right — flip the language toggle above and it mirrors for free.',
    },
    toggle: {
      title: 'Toggle / switch',
      offExample: 'Off example',
      interactiveExample: 'Interactive example',
      disabledExample: 'Disabled example',
      disabledCheckedExample: 'Disabled — checked example',
    },
    emptyStateTitle: 'Empty state',
  },
};
