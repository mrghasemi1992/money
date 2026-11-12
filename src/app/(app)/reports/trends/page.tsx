import type { Metadata } from "next";

import { Reports } from "@/components/reports";
import { budgetRecord, rangeTotals } from "@/db/reports";

import { loadReportPeriod, reportTitle } from "../period";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await reportTitle("trends") };
}

/**
 * The period month by month: income and expense per month, the savings rate and how often
 * budgets held. For a single month, it and the five before.
 */
export default async function ReportsTrendsPage({
  searchParams,
}: PageProps<"/reports/trends">) {
  const period = await loadReportPeriod(searchParams);
  const [months, budgets] = await Promise.all([
    rangeTotals(period.months),
    budgetRecord(period.months),
  ]);

  return (
    <Reports
      period={period}
      section="trends"
      data={{
        months: period.months.map((month, index) => ({
          ...month,
          ...months[index],
        })),
        budgets,
      }}
    />
  );
}
