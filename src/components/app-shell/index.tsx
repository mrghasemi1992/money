"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
  type AddTransactionActions,
  AddTransactionProvider,
} from "@/components/add-transaction";
import { Sidebar } from "@/components/sidebar";
import { TabBar } from "@/components/tab-bar";
import { TopBar } from "@/components/top-bar";
import { findNavItem, getNavItems } from "@/helpers/navigation";
import { canManageUsers, canWrite } from "@/helpers/role";
import type { TransactionOptions } from "@/types/transaction";
import type { UserRole } from "@/types/user";

import styles from "./styles.module.css";

/** Target of the skip link. */
const MAIN_ID = "main";

type AppShellProps = {
  /** The signed-in user. The role comes from the server (the user record), never from the client. */
  user: { name: string; role: UserRole };
  /** Ends the session (the signOut Server Action). */
  onSignOut: () => Promise<void>;
  /**
   * For editors and admins: what the add-transaction form chooses from (a promise, so the
   * shell doesn't wait) and its Server Actions. Null for viewers.
   */
  transactionOptions?: Promise<TransactionOptions> | null;
  transactionActions?: AddTransactionActions | null;
  children: ReactNode;
};

/**
 * The frame around every signed-in page. From 768px up: the sidebar on the start side. On
 * phones: a top bar, the bottom tab bar and the floating add button. A skip link jumps past
 * the navigation. Admins also get user management; editors and admins the add-transaction
 * buttons. The pages check the role again on the server.
 */
export function AppShell({
  user,
  onSignOut,
  transactionOptions = null,
  transactionActions = null,
  children,
}: AppShellProps) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const items = getNavItems(user.role);
  const tabs = items.filter((item) => item.tab);
  const onTab = findNavItem(tabs, pathname) !== undefined;
  // A subpage (/settings/accounts) goes back to its section, anything else to the dashboard.
  const section = findNavItem(items, pathname);
  const backHref = section && section.href !== pathname ? section.href : "/";

  return (
    <AddTransactionProvider
      enabled={canWrite(user.role)}
      options={transactionOptions}
      actions={transactionActions}
    >
      <div className={styles.root}>
        <a href={`#${MAIN_ID}`} className={styles.skipLink}>
          {t("skipToContent")}
        </a>
        <Sidebar items={items} user={user} onSignOut={onSignOut} />
        <div className={styles.column}>
          <TopBar
            user={user}
            showBack={!onTab}
            backHref={backHref}
            showUsersLink={canManageUsers(user.role)}
            onSignOut={onSignOut}
          />
          <main id={MAIN_ID} tabIndex={-1} className={styles.main}>
            {children}
          </main>
          <TabBar items={tabs} />
        </div>
      </div>
    </AddTransactionProvider>
  );
}
