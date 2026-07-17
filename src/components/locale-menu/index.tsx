import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10h16M10 2c2.2 2.4 2.2 13.6 0 16M10 2c-2.2 2.4-2.2 13.6 0 16" />
          </svg>
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 10l4 4 8-8" />
                  </svg>
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
