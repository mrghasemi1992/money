import { Plus } from 'lucide-react';
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
      <Plus size={18} strokeWidth={1.8} aria-hidden="true" />
    </Button>
  );
}
