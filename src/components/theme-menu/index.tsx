import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/primitives';
import { useThemeStore, type ThemeMode } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

const ICON_PATHS: Record<ThemeMode, string> = {
  light:
    'M10 6a4 4 0 100 8 4 4 0 000-8zM10 1.5v2M10 16.5v2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M1.5 10h2M16.5 10h2M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4',
  dark: 'M16 12.5A6.5 6.5 0 118 3a5.2 5.2 0 008 9.5z',
  system: 'M3 4h14v9H3V4zM7.5 17h5M10 13v4',
};

function ModeIcon({ mode }: { mode: ThemeMode }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[mode]} />
    </svg>
  );
}

export function ThemeMenu() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const { t } = useTranslation();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className={styles.trigger}
          title={t.nav.theme}
          aria-label={t.nav.theme}
        >
          <ModeIcon mode={mode} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.content}
          align="start"
          sideOffset={8}
        >
          <DropdownMenu.RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as ThemeMode)}
          >
            {MODES.map((option) => (
              <DropdownMenu.RadioItem
                key={option}
                value={option}
                className={styles.item}
              >
                <ModeIcon mode={option} />
                <span>{t.theme[option]}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
