import { RoutePlaceholder } from '@/components';
import { useTranslation } from '@/i18n';

export function TransactionsPage() {
  const { t } = useTranslation();
  return <RoutePlaceholder title={t.nav.transactions} />;
}
