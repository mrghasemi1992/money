import { Button } from '@primitives/button';
import { useTranslation } from '../../i18n';
import styles from './styles.module.css';

export interface EmptyStateProps {
  onAction?: () => void;
}

export function EmptyState({ onAction }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <div className={styles.icon} aria-hidden="true">
        <div className={styles.iconLine} style={{ width: '100%' }} />
        <div className={styles.iconLine} style={{ width: '70%' }} />
        <div
          className={styles.iconLine}
          style={{ width: '40%', marginBottom: 0 }}
        />
      </div>
      <div className={styles.title}>{t.emptyState.title}</div>
      <p className={styles.body}>{t.emptyState.body}</p>
      <Button variant="secondary" onClick={onAction}>
        {t.emptyState.cta}
      </Button>
    </div>
  );
}
