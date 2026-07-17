import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/sidebar-nav';
import { BottomNav } from '@/components/bottom-nav';
import { AddTransactionFab } from '@/components/add-transaction-fab';
import { useTranslation } from '@/i18n';
import styles from './styles.module.css';

const MOBILE_BREAKPOINT = 640;

// Mirrors useAppliedTheme's prefers-color-scheme listener — mobile vs.
// desktop chrome is a live viewport breakpoint, not a one-time check.
function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    );
    const onChange = (event: MediaQueryListEvent) =>
      setIsMobile(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function AppShell() {
  const { t } = useTranslation();
  const isMobile = useMobileViewport();

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        {t.nav.skipToContent}
      </a>
      {!isMobile && <SidebarNav />}
      <main
        id="main-content"
        className={`${styles.main} ${isMobile ? styles.mainMobile : ''}`}
      >
        <Outlet />
      </main>
      {isMobile && (
        <>
          <AddTransactionFab />
          <BottomNav />
        </>
      )}
    </div>
  );
}
