import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/primitives';
import { useLocaleStore, type Locale } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

const LABELS: Record<Locale, string> = { en: 'English', fa: 'فارسی' };
const CODES: Record<Locale, string> = { en: 'EN', fa: 'فا' };
const LOCALES: Locale[] = ['en', 'fa'];

export function LocaleMenu() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const { t } = useTranslation();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className={styles.trigger}
          title={t.nav.language}
          aria-label={t.nav.language}
        >
          <Globe size={14} strokeWidth={1.5} aria-hidden="true" />
          <span>{CODES[locale]}</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.content}
          align="start"
          sideOffset={8}
        >
          <DropdownMenu.RadioGroup
            value={locale}
            onValueChange={(value) => setLocale(value as Locale)}
          >
            {LOCALES.map((option) => (
              <DropdownMenu.RadioItem
                key={option}
                value={option}
                className={styles.item}
              >
                <span
                  lang={option}
                  dir={option === 'fa' ? 'rtl' : 'ltr'}
                  className={option === 'fa' ? styles.fa : undefined}
                >
                  {LABELS[option]}
                </span>
                <DropdownMenu.ItemIndicator className={styles.indicator}>
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
