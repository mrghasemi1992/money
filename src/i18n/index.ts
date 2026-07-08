import { useLocaleStore } from '../stores/locale-store';
import { en } from './locales/en';
import { fa } from './locales/fa';

const dictionaries = { en, fa };

export const BCP47_TAG = { en: 'en-US', fa: 'fa-IR' } as const;

/** Reads the active locale's dictionary — for currency/number formatting,
 * see `formatAmount` in `./format`. */
export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  return { locale, t: dictionaries[locale] };
}
