import { PanelLeft } from 'lucide-react';
import { useUiStore } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function SidebarTrigger() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore(
    (state) => state.toggleSidebarCollapsed,
  );
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={styles.trigger}
      data-collapsed={collapsed}
      onClick={toggleSidebarCollapsed}
      aria-label={
        collapsed ? t.nav.expandNavigation : t.nav.collapseNavigation
      }
      title={collapsed ? t.nav.expandNavigation : t.nav.collapseNavigation}
    >
      <PanelLeft size={18} strokeWidth={1.6} aria-hidden="true" />
    </button>
  );
}
