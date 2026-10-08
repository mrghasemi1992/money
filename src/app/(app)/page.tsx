import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { requireUser } from "@/auth/session";
import { AddTransactionButton } from "@/components/add-transaction";
import {
  BalanceOverview,
  BalanceOverviewSkeleton,
} from "@/components/balance-overview";
import {
  BudgetProgress,
  BudgetProgressSkeleton,
} from "@/components/budget-progress";
import { Dashboard } from "@/components/dashboard";
import { FirstRun } from "@/components/first-run";
import {
  MonthOverview,
  MonthOverviewSkeleton,
} from "@/components/month-overview";
import { PageHeader } from "@/components/page-header";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "@/components/recent-transactions";
import { TopSpending, TopSpendingSkeleton } from "@/components/top-spending";
import { DateText } from "@/components/ui/date-text";
import { UnknownNotice } from "@/components/unknown-notice";
import {
  DASHBOARD_BUDGET_COUNT,
  DASHBOARD_RECENT_COUNT,
  DASHBOARD_SPENDING_SLICES,
} from "@/constants/dashboard";
import { listAccounts } from "@/db/accounts";
import { listBudgetCategories } from "@/db/budgets";
import { getBookProgress } from "@/db/dashboard";
import { categoryTotals } from "@/db/reports";
import {
  listTransactions,
  transactionTotals,
  unknownTransactionSummary,
} from "@/db/transactions";
import { resolveBudgetMonth } from "@/helpers/budget";
import {
  closestBudgets,
  spendingSlices,
  unknownTransactionsHref,
} from "@/helpers/dashboard";
import { canWrite, toUserRole } from "@/helpers/role";
import { NO_TRANSACTION_FILTERS } from "@/helpers/transaction-filters";
import { getPreferences } from "@/i18n/preferences";
import type { BudgetMonth } from "@/types/budget";
import { todayIso } from "@/utils/iso-date";
import { firstName } from "@/utils/text";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("dashboard") };
}

/**
 * The first page after sign-in. Until the book has accounts and transactions it shows the
 * first-run steps (editors and admins) or a note (viewers). After that, each section reads
 * its own data in its own Suspense boundary, so the queries run in parallel and a slow one
 * holds up only its card. «This month» is the viewer's current month, as a Gregorian range.
 */
export default async function DashboardPage() {
  const { user } = await requireUser();
  const t = await getTranslations("dashboard");
  const { calendar, timeZone } = await getPreferences();
  const today = todayIso(timeZone);
  const writer = canWrite(toUserRole(user.role));
  const progress = await getBookProgress(user.id);
  const firstRun = !progress.hasAccounts || !progress.hasTransactions;
  const name = firstName(user.name);

  const header = (
    <PageHeader
      title={t(firstRun ? "welcome" : "greeting", { name })}
      subtitle={<DateText value={today} format="weekday" />}
      actions={writer && !firstRun ? <AddTransactionButton /> : null}
    />
  );

  if (firstRun) {
    return (
      <>
        {header}
        <FirstRun canWrite={writer} progress={progress} />
      </>
    );
  }

  const month = resolveBudgetMonth(null, calendar, today);
  return (
    <Dashboard
      header={header}
      notice={
        <Suspense fallback={null}>
          <UnknownSection />
        </Suspense>
      }
      balances={
        <Suspense fallback={<BalanceOverviewSkeleton />}>
          <BalancesSection />
        </Suspense>
      }
      month={
        <Suspense fallback={<MonthOverviewSkeleton />}>
          <MonthSection month={month} />
        </Suspense>
      }
      recent={
        <Suspense fallback={<RecentTransactionsSkeleton />}>
          <RecentSection />
        </Suspense>
      }
      budgets={
        <Suspense fallback={<BudgetProgressSkeleton />}>
          <BudgetsSection month={month} canWrite={writer} />
        </Suspense>
      }
      spending={
        <Suspense fallback={<TopSpendingSkeleton />}>
          <SpendingSection month={month} />
        </Suspense>
      }
    />
  );
}

/** «۳ تراکنش ناشناس دارید», when there are any in the book. */
async function UnknownSection() {
  const { count, oldest } = await unknownTransactionSummary();
  if (count === 0) return null;
  return <UnknownNotice count={count} href={unknownTransactionsHref(oldest)} />;
}

async function BalancesSection() {
  return <BalanceOverview accounts={await listAccounts()} />;
}

async function MonthSection({ month }: { month: BudgetMonth }) {
  const totals = await transactionTotals({
    ...NO_TRANSACTION_FILTERS,
    from: month.from,
    to: month.to,
  });
  return (
    <MonthOverview totals={totals} year={month.year} month={month.month} />
  );
}

async function RecentSection() {
  const page = await listTransactions(
    NO_TRANSACTION_FILTERS,
    null,
    DASHBOARD_RECENT_COUNT,
  );
  return <RecentTransactions transactions={page.rows} />;
}

async function BudgetsSection({
  month,
  canWrite,
}: {
  month: BudgetMonth;
  canWrite: boolean;
}) {
  const categories = await listBudgetCategories(month.from, month.to);
  return (
    <BudgetProgress
      budgets={closestBudgets(categories, DASHBOARD_BUDGET_COUNT)}
      canWrite={canWrite}
    />
  );
}

async function SpendingSection({ month }: { month: BudgetMonth }) {
  const { expense } = await categoryTotals(month);
  return (
    <TopSpending
      slices={spendingSlices(expense, DASHBOARD_SPENDING_SLICES)}
      year={month.year}
      month={month.month}
    />
  );
}
