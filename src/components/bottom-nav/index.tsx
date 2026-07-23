import { NavLink } from 'react-router-dom';
import { NAV_ICONS, NAV_ITEMS } from '@/constants';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav aria-label={t.nav.primaryLabel} className={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.key];
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
            <span className={styles.navLabel}>{t.nav[item.key]}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
