import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

interface Props {
  title: string;
}

export function RoutePlaceholder({ title }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <div className={styles.eyebrow}>{t.nav.route}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.placeholder}>
        <div className={styles.icon} aria-hidden="true">
          <div className={`${styles.iconLine} ${styles.iconLineLong}`} />
          <div className={`${styles.iconLine} ${styles.iconLineMedium}`} />
          <div className={`${styles.iconLine} ${styles.iconLineShort}`} />
        </div>
        <div className={styles.placeholderText}>{t.nav.placeholderText}</div>
      </div>
    </div>
  );
}
