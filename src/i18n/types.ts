export interface Dictionary {
  brand: string;
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  nav: {
    primaryLabel: string;
    dashboard: string;
    transactions: string;
    reports: string;
    budgets: string;
    addTransaction: string;
    collapseNavigation: string;
    expandNavigation: string;
    skipToContent: string;
    language: string;
    theme: string;
    settings: string;
    route: string;
    placeholderText: string;
  };
  settings: {
    title: string;
    lede: string;
    language: string;
    languageHint: string;
    theme: string;
    themeHint: string;
  };
  emptyState: {
    title: string;
    body: string;
    cta: string;
  };
  designSystem: {
    eyebrow: string;
    title: string;
    lede: string;
    color: {
      title: string;
      neutralLabels: {
        bg: string;
        surface: string;
        border: string;
        mutedText: string;
        text: string;
      };
      accentLabel: string;
      negativeLabel: string;
      description: string;
      testBadge: string;
    };
    type: {
      title: string;
      displayLabel: string;
      bodyLabel: string;
      numericLabel: string;
      captionLabel: string;
      withoutTabular: string;
      withTabular: string;
    };
    spacing: {
      title: string;
    };
    elevation: {
      title: string;
    };
    button: {
      title: string;
      primary: string;
      secondary: string;
      ghost: string;
      destructive: string;
      disabledSuffix: string;
    };
    input: {
      title: string;
      accountName: string;
      accountPlaceholder: string;
      accountHint: string;
      openingBalance: string;
      openingError: string;
      currency: string;
    };
    card: {
      title: string;
      defaultLabel: string;
      interactiveLabel: string;
      cardTitle: string;
      cardBody: string;
    };
    table: {
      title: string;
      descriptionBefore: string;
      descriptionCode: string;
      descriptionAfter: string;
    };
    toggle: {
      title: string;
      offExample: string;
      interactiveExample: string;
      disabledExample: string;
      disabledCheckedExample: string;
    };
    emptyStateTitle: string;
  };
}
