import type { Metadata } from "next";

import { Reports } from "@/components/reports";
import {
  REPORT_LARGEST_COUNT,
  REPORT_RECURRING_COUNT,
} from "@/constants/report";
import {
  categoryTotals,
  compareTotals,
  largestTransactions,
  recurringExpenses,
} from "@/db/reports";
import { recurringMinMonths } from "@/helpers/report";

import { loadReportPeriod, reportTitle } from "../period";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await reportTitle("overview") };
}

/**
 * The reports' overview for a period of the viewer's calendar, read from the URL (the last 6
 * months by default): income, expense and net against the period before, then the findings
 * (the biggest changes in spending, recurring spending, the largest transactions). The queries
 * run in parallel and sum in Postgres. Recurring spending uses the chart's months.
 */
export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const period = await loadReportPeriod(searchParams);
  const [totals, categories, previousCategories, recurring, largest] =
    await Promise.all([
      compareTotals(period, period.previous),
      categoryTotals(period),
      categoryTotals(period.previous),
      recurringExpenses(
        period.months,
        recurringMinMonths(period.months.length),
        REPORT_RECURRING_COUNT,
      ),
      largestTransactions(period, REPORT_LARGEST_COUNT),
    ]);

  return (
    <Reports
      period={period}
      section="overview"
      data={{
        totals: totals.current,
        previousTotals: totals.previous,
        expenses: categories.expense,
        previousExpenses: previousCategories.expense,
        recurring,
        largest,
      }}
    />
  );
}
