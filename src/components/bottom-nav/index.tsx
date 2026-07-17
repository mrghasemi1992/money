import { NavLink } from 'react-router-dom';
import { NAV_ICON_PATHS, NAV_ITEMS } from '@/components/nav-items';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav aria-label={t.nav.primaryLabel} className={styles.nav}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={NAV_ICON_PATHS[item.key]} />
          </svg>
          <span className={styles.navLabel}>{t.nav[item.key]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
