import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/primitives';
import { useThemeStore, type ThemeMode } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

const MODE_ICONS: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

function ModeIcon({ mode }: { mode: ThemeMode }) {
  const Icon = MODE_ICONS[mode];
  return <Icon size={15} strokeWidth={1.5} aria-hidden="true" />;
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
