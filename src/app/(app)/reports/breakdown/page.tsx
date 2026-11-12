import type { Metadata } from "next";

import { Reports } from "@/components/reports";
import { accountExpenseTotals, categoryTotals } from "@/db/reports";

import { loadReportPeriod, reportTitle } from "../period";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await reportTitle("breakdown") };
}

/**
 * Where the period's money went: income and expense by category (subcategories rolled up,
 * opening below them) and spending by account.
 */
export default async function ReportsBreakdownPage({
  searchParams,
}: PageProps<"/reports/breakdown">) {
  const period = await loadReportPeriod(searchParams);
  const [categories, accounts] = await Promise.all([
    categoryTotals(period),
    accountExpenseTotals(period),
  ]);

  return (
    <Reports
      period={period}
      section="breakdown"
      data={{ categories, accounts }}
    />
  );
}
