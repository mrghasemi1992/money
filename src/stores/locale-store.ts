import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'fa';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// Active locale has no natural home in Dexie — it's a UI-only preference,
// persisted straight to localStorage so it's available before the app
// mounts. The blocking script in index.html reads the same 'settle-locale'
// key to set dir/lang before first paint and avoid a layout flash.
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'settle-locale' },
  ),
);

/** Keeps `<html lang dir>` in sync with the active locale so RTL and
 * font-family selectors (`:lang(fa)`) apply from the document root. */
export function useAppliedLocale(): Locale {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale]);

  return locale;
}
