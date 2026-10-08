import { useTranslations } from "next-intl";

import { SAMPLE_ACCOUNTS } from "@/components/account-list/sample-accounts";
import { AddTransactionButton } from "@/components/add-transaction";
import { BalanceOverview } from "@/components/balance-overview";
import { SAMPLE_BUDGET_CATEGORIES } from "@/components/budget-list/sample-budgets";
import { BudgetProgress } from "@/components/budget-progress";
import { MonthOverview } from "@/components/month-overview";
import { PageHeader } from "@/components/page-header";
import { RecentTransactions } from "@/components/recent-transactions";
import { TopSpending } from "@/components/top-spending";
import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTIONS,
} from "@/components/transaction-list/sample-transactions";
import { DateText } from "@/components/ui/date-text";
import { UnknownNotice } from "@/components/unknown-notice";
import {
  DASHBOARD_BUDGET_COUNT,
  DASHBOARD_RECENT_COUNT,
  DASHBOARD_SPENDING_SLICES,
} from "@/constants/dashboard";
import { resolveBudgetMonth } from "@/helpers/budget";
import {
  closestBudgets,
  spendingSlices,
  unknownTransactionsHref,
} from "@/helpers/dashboard";
import { usePreferences } from "@/hooks/use-preferences";
import type { CategoryReportRow } from "@/types/report";

import { Dashboard } from "./index";

/*
 * The dashboard with sample figures, for stories (its own and the app shell's): the sample
 * accounts, budgets and transactions around 7 October 2026 (15 Mehr 1405).
 */

/** This month's expenses by category: the sample budgets' spending, plus some uncategorized. */
const SAMPLE_EXPENSES: CategoryReportRow[] = [
  ...SAMPLE_BUDGET_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
    amount: category.spent,
    direct: category.spent,
    subcategories: [],
  })),
  {
    id: null,
    name: "",
    color: "slate" as const,
    amount: 1450000,
    direct: 1450000,
    subcategories: [],
  },
].sort((a, b) => b.amount - a.amount);

const SAMPLE_MONTH_TOTALS = {
  income: 420000000,
  expense: SAMPLE_EXPENSES.reduce((sum, row) => sum + row.amount, 0),
};

type SampleDashboardProps = {
  canWrite: boolean;
  /** Unknown transactions in the book: the notice shows when there are any. */
  unknownCount?: number;
};

export function SampleDashboard({
  canWrite,
  unknownCount = 3,
}: SampleDashboardProps) {
  const t = useTranslations("dashboard");
  const { calendar } = usePreferences();
  // The month follows the toolbar's calendar: Mehr 1405 or October 2026.
  const month = resolveBudgetMonth(null, calendar, SAMPLE_TODAY);
  return (
    <Dashboard
      header={
        <PageHeader
          title={t("greeting", { name: "سارا" })}
          subtitle={<DateText value={SAMPLE_TODAY} format="weekday" />}
          actions={canWrite ? <AddTransactionButton /> : null}
        />
      }
      notice={
        unknownCount > 0 ? (
          <UnknownNotice
            count={unknownCount}
            href={unknownTransactionsHref("2026-09-02")}
          />
        ) : null
      }
      balances={<BalanceOverview accounts={SAMPLE_ACCOUNTS} />}
      month={
        <MonthOverview
          totals={SAMPLE_MONTH_TOTALS}
          year={month.year}
          month={month.month}
        />
      }
      recent={
        <RecentTransactions
          transactions={SAMPLE_TRANSACTIONS.slice(0, DASHBOARD_RECENT_COUNT)}
          today={SAMPLE_TODAY}
        />
      }
      budgets={
        <BudgetProgress
          budgets={closestBudgets(
            SAMPLE_BUDGET_CATEGORIES,
            DASHBOARD_BUDGET_COUNT,
          )}
          canWrite={canWrite}
        />
      }
      spending={
        <TopSpending
          slices={spendingSlices(SAMPLE_EXPENSES, DASHBOARD_SPENDING_SLICES)}
          year={month.year}
          month={month.month}
        />
      }
    />
  );
}
