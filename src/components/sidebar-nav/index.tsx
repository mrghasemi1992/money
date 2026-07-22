import { NavLink } from 'react-router-dom';
import { ChevronLeft, Settings } from 'lucide-react';
import { NAV_ICONS, NAV_ITEMS } from '@/components/nav-items';
import { useUiStore } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function SidebarNav() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useUiStore(
    (state) => state.toggleSidebarCollapsed,
  );
  const { locale, t } = useTranslation();

  const chevronMirrored = (locale === 'fa') !== collapsed;

  return (
    <nav
      aria-label={t.nav.primaryLabel}
      className={styles.nav}
      data-collapsed={collapsed}
    >
      <div className={styles.brandRow}>
        <div className={styles.brand}>
          <div className={styles.mark} aria-hidden="true" />
          <span className={styles.wordmark}>{t.brand}</span>
        </div>
        <button
          type="button"
          className={styles.collapseButton}
          onClick={toggleSidebarCollapsed}
          aria-label={
            collapsed ? t.nav.expandNavigation : t.nav.collapseNavigation
          }
          title={
            collapsed ? t.nav.expandNavigation : t.nav.collapseNavigation
          }
        >
          <ChevronLeft
            size={14}
            strokeWidth={1.6}
            className={chevronMirrored ? styles.chevronMirrored : undefined}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.key];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={t.nav[item.key]}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Icon
                size={18}
                strokeWidth={1.6}
                className={styles.navIcon}
                aria-hidden="true"
              />
              <span className={styles.navLabel}>{t.nav[item.key]}</span>
            </NavLink>
          );
        })}
      </div>

      <NavLink
        to="/settings"
        title={t.nav.settings}
        className={({ isActive }) =>
          `${styles.navItem} ${styles.settingsItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <Settings
          size={18}
          strokeWidth={1.6}
          className={styles.navIcon}
          aria-hidden="true"
        />
        <span className={styles.navLabel}>{t.nav.settings}</span>
      </NavLink>
    </nav>
  );
}
