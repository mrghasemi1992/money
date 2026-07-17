import { NavLink } from 'react-router-dom';
import { Button } from '@/components/primitives';
import { LocaleMenu } from '@/components/locale-menu';
import { ThemeMenu } from '@/components/theme-menu';
import { NAV_ICON_PATHS, NAV_ITEMS } from '@/components/nav-items';
import { useUiStore } from '@/stores';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.navIcon}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

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
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={chevronMirrored ? styles.chevronMirrored : undefined}
            aria-hidden="true"
          >
            <path d="M12 5l-5 5 5 5" />
          </svg>
        </button>
      </div>

      <div className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={t.nav[item.key]}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <NavIcon path={NAV_ICON_PATHS[item.key]} />
            <span className={styles.navLabel}>{t.nav[item.key]}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.footer}>
        <Button
          type="button"
          variant="primary"
          className={styles.addButton}
          aria-label={t.nav.addTransaction}
          title={t.nav.addTransaction}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M10 4v12M4 10h12" />
          </svg>
          <span className={styles.addLabel}>{t.nav.addTransaction}</span>
        </Button>
        <div className={styles.divider} />
        <div className={styles.controlsRow}>
          <LocaleMenu />
          <ThemeMenu />
        </div>
      </div>
    </nav>
  );
}
