import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { Reports } from "@/components/reports";
import {
  accountExpenseTotals,
  categoryTotals,
  compareTotals,
  rangeTotals,
} from "@/db/reports";
import { parseReportParams, resolveReportPeriod } from "@/helpers/report";
import { getPreferences } from "@/i18n/preferences";
import { todayIso } from "@/utils/iso-date";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("reports") };
}

/**
 * Reports for a period of the viewer's calendar, read from the URL (the last 6 months by
 * default). The period becomes Gregorian ranges (monthRange) before the queries, which run
 * in parallel and sum in Postgres. Every role reads the whole book.
 */
export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  await requireUser();
  const { calendar, timeZone } = await getPreferences();
  const period = resolveReportPeriod(
    parseReportParams(await searchParams),
    calendar,
    todayIso(timeZone),
  );

  const [totals, categories, accounts, months] = await Promise.all([
    compareTotals(period, period.previous),
    categoryTotals(period),
    accountExpenseTotals(period),
    rangeTotals(period.months),
  ]);

  return (
    <Reports
      period={period}
      data={{
        totals: totals.current,
        previousTotals: totals.previous,
        categories,
        accounts,
        months: period.months.map((month, index) => ({
          ...month,
          ...months[index],
        })),
      }}
    />
  );
}
