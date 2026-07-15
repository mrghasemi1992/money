import * as RadioGroup from '@radix-ui/react-radio-group';
import { useLocaleStore, type Locale } from '@/stores';
import styles from './styles.module.css';

const LABELS: Record<Locale, string> = { en: 'English', fa: 'فارسی' };
const LOCALES: Locale[] = ['en', 'fa'];

export function LocaleToggle() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <RadioGroup.Root
      className={styles.root}
      value={locale}
      onValueChange={(value) => setLocale(value as Locale)}
      aria-label="Language"
    >
      {LOCALES.map((option) => (
        <RadioGroup.Item
          key={option}
          value={option}
          className={styles.item}
          lang={option}
        >
          {LABELS[option]}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
