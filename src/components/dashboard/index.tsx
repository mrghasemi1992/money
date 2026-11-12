import type { ReactNode } from "react";

import { AddTransactionButton } from "@/components/add-transaction";
import { BalanceOverviewSkeleton } from "@/components/balance-overview";
import { BudgetProgressSkeleton } from "@/components/budget-progress";
import { MonthOverviewSkeleton } from "@/components/month-overview";
import { PageHeader } from "@/components/page-header";
import { PageLoadingStatus } from "@/components/page-skeleton";
import { RecentTransactionsSkeleton } from "@/components/recent-transactions";
import { TopSpendingSkeleton } from "@/components/top-spending";
import { Skeleton } from "@/components/ui/skeleton";

import { cx } from "@/utils/cx";

import styles from "./styles.module.css";

type DashboardProps = {
  /** The PageHeader: the greeting and today's date. */
  header: ReactNode;
  /** The unknown-transactions notice, or nothing. */
  notice?: ReactNode;
  /** The total balance with each account's (BalanceOverview). */
  balances: ReactNode;
  /** This month's income, expense and net (MonthOverview). */
  month: ReactNode;
  /** The latest transactions (RecentTransactions). */
  recent: ReactNode;
  /** The budgets closest to their limit (BudgetProgress). */
  budgets: ReactNode;
  /** This month's largest expense categories (TopSpending). */
  spending: ReactNode;
};

/**
 * The dashboard's layout: the header and notice, then the balance beside this month, then the
 * recent transactions beside the budgets and top spending. Each pair sits side by side while
 * there is room and stacks below that. The page passes each section in its own Suspense
 * boundary, so a slow query holds up only its own card.
 */
export function Dashboard({
  header,
  notice,
  balances,
  month,
  recent,
  budgets,
  spending,
}: DashboardProps) {
  return (
    <div className={styles.root}>
      {header}
      {notice}
      <div className={cx(styles.row, styles.top)}>
        <div className={styles.main}>{balances}</div>
        <div className={styles.side}>{month}</div>
      </div>
      <div className={styles.row}>
        <div className={styles.main}>{recent}</div>
        <div className={styles.side}>
          {budgets}
          {spending}
        </div>
      </div>
    </div>
  );
}

/**
 * The dashboard while the page loads (loading.tsx): the greeting and date as placeholders, the
 * add button for writers, and every section's skeleton in the dashboard's own layout.
 */
export function DashboardSkeleton() {
  return (
    <Dashboard
      header={
        <PageHeader
          title={<Skeleton variant="text" width="160px" />}
          subtitle={<Skeleton variant="text" width="136px" />}
          actions={<AddTransactionButton />}
        />
      }
      notice={<PageLoadingStatus />}
      balances={<BalanceOverviewSkeleton />}
      month={<MonthOverviewSkeleton />}
      recent={<RecentTransactionsSkeleton />}
      budgets={<BudgetProgressSkeleton />}
      spending={<TopSpendingSkeleton />}
    />
  );
}
