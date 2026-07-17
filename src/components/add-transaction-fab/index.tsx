import { Button } from '@/components/primitives';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function AddTransactionFab() {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      variant="primary"
      className={styles.fab}
      aria-label={t.nav.addTransaction}
      title={t.nav.addTransaction}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M10 4v12M4 10h12" />
      </svg>
    </Button>
  );
}
