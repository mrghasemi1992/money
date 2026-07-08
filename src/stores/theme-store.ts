import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// Theme mode has no natural home in Dexie — it's a UI-only preference that
// must be readable before the app (and IndexedDB) has mounted, so it's
// persisted straight to localStorage via zustand's persist middleware. The
// blocking script in index.html reads the same 'settle-theme' key to avoid
// a flash of the wrong theme before React hydrates.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'settle-theme' },
  ),
);

function getSystemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Resolves the active theme mode against the system preference, and keeps
 * `<html data-theme>` in sync so theme-dark.css / theme-light.css apply. */
export function useAppliedTheme(): ResolvedTheme {
  const mode = useThemeStore((state) => state.mode);
  const [systemPrefersDark, setSystemPrefersDark] =
    useState(getSystemPrefersDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) =>
      setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const resolved: ResolvedTheme =
    mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  return resolved;
}
