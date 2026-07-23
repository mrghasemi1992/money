import { NavLink } from 'react-router-dom';
import { Settings, Wallet } from 'lucide-react';
import { NAV_ICONS, NAV_ITEMS } from '@/constants';
import { useUiStore } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function SidebarNav() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t.nav.primaryLabel}
      className={styles.nav}
      data-collapsed={collapsed}
    >
      <div className={styles.brandRow}>
        <div className={styles.brand}>
          <Wallet
            size={18}
            strokeWidth={2}
            className={styles.mark}
            aria-hidden="true"
          />
          <span className={styles.wordmark}>{t.brand}</span>
        </div>
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
