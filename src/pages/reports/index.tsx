import { RoutePlaceholder } from '@/components';
import { useTranslation } from '@/i18n';

export function ReportsPage() {
  const { t } = useTranslation();
  return <RoutePlaceholder title={t.nav.reports} />;
}
