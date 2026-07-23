import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarTrigger } from '@/components/sidebar-trigger';
import { BottomNav } from '@/components/bottom-nav';
import { AddTransactionFab } from '@/components/add-transaction-fab';
import { useTranslation } from '@/i18n';
import { useMobileViewport } from '@/hooks';
import styles from './styles.module.css';

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
        {!isMobile && <SidebarTrigger />}
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
