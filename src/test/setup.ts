import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia — stub it so hooks that read
// prefers-color-scheme or viewport breakpoints (useAppliedTheme,
// SidebarNav's narrow-viewport check) can mount under Vitest.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
