import { Card } from '@/components/primitives';
import { LocaleMenu } from '@/components/locale-menu';
import { ThemeMenu } from '@/components/theme-menu';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>{t.settings.title}</h1>
        <p className={styles.lede}>{t.settings.lede}</p>
      </div>

      <Card className={styles.card}>
        <div className={styles.row}>
          <div>
            <div className={styles.rowLabel}>{t.settings.language}</div>
            <div className={styles.rowHint}>{t.settings.languageHint}</div>
          </div>
          <LocaleMenu />
        </div>
        <div className={styles.rowDivider} />
        <div className={styles.row}>
          <div>
            <div className={styles.rowLabel}>{t.settings.theme}</div>
            <div className={styles.rowHint}>{t.settings.themeHint}</div>
          </div>
          <ThemeMenu />
        </div>
      </Card>
    </div>
  );
}
