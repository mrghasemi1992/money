import * as RadioGroup from '@radix-ui/react-radio-group';
import { useThemeStore, type ThemeMode } from '../../stores/theme-store';
import { useTranslation } from '../../i18n';
import styles from './styles.module.css';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const { t } = useTranslation();

  return (
    <RadioGroup.Root
      className={styles.root}
      value={mode}
      onValueChange={(value) => setMode(value as ThemeMode)}
      aria-label="Theme"
    >
      {MODES.map((option) => (
        <RadioGroup.Item key={option} value={option} className={styles.item}>
          {t.theme[option]}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
