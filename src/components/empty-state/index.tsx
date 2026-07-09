import { Button } from '@/components/primitives';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

interface Props {
  onAction?: () => void;
}

export function EmptyState({ onAction }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <div className={styles.icon} aria-hidden="true">
        <div className={`${styles.iconLine} ${styles.iconLineLong}`} />
        <div className={`${styles.iconLine} ${styles.iconLineMedium}`} />
        <div className={`${styles.iconLine} ${styles.iconLineShort}`} />
      </div>
      <div className={styles.title}>{t.emptyState.title}</div>
      <p className={styles.body}>{t.emptyState.body}</p>
      <Button variant="secondary" onClick={onAction}>
        {t.emptyState.cta}
      </Button>
    </div>
  );
}
