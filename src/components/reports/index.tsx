"use client";

import { ChartPieIcon, PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { useReportNavigation } from "@/components/navigation-progress";
import { useAddTransaction } from "@/components/add-transaction";
import { AccountReport } from "@/components/account-report";
import {
  CategoryReport,
  CategoryReportSkeleton,
} from "@/components/category-report";
import { MonthlyReport } from "@/components/monthly-report";
import { PageHeader } from "@/components/page-header";
import { PageLoadingStatus } from "@/components/page-skeleton";
import { ListError } from "@/components/page-status";
import { ReportCardSkeleton } from "@/components/report-card";
import {
  ReportPeriodBar,
  ReportPeriodBarSkeleton,
  ReportPeriodSwitch,
  ReportPeriodSwitchSkeleton,
  usePeriodText,
} from "@/components/report-period";
import {
  ReportSummary,
  ReportSummarySkeleton,
} from "@/components/report-summary";
import { BarListSkeleton } from "@/components/ui/bar-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ColumnChartLegend,
  ColumnChartSkeleton,
} from "@/components/ui/column-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { REPORT_TREND_MONTHS } from "@/constants/report";
import { reportParamsToSearch } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportData, ReportParams, ReportPeriod } from "@/types/report";
import { formatMonth } from "@/utils/calendar";

import styles from "./styles.module.css";

type ReportsProps = {
  /** The period shown, resolved in the viewer's calendar (from the URL). */
  period: ReportPeriod;
  data: ReportData;
};

/**
 * The /reports page: a period in the URL (a month, the last 3, 6 or 12 months, or a custom
 * range), its income, expense and net against the period before, income and expense by
 * category (subcategories rolled up, opening below them), spending by account, and month by
 * month. Every chart switches to a table of the same figures. Transfers count nowhere.
 */
export function Reports({ period, data }: ReportsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { calendar } = usePreferences();
  const router = useRouter();
  const pathname = usePathname();
  const [navigating, startNavigation] = useTransition();
  useReportNavigation(navigating);
  const periodText = usePeriodText();
  const addTransaction = useAddTransaction();

  function changePeriod(params: ReportParams) {
    startNavigation(() => {
      router.push(`${pathname}${reportParamsToSearch(params)}`, {
        scroll: false,
      });
    });
  }

  const isEmpty = data.totals.income === 0 && data.totals.expense === 0;
  const trendSubtitle =
    period.kind === "month" && period.month
      ? t("reports.monthly.trend", {
          month: formatMonth(
            calendar,
            locale,
            period.month.year,
            period.month.month,
          ),
        })
      : periodText(period);

  return (
    <div className={styles.root}>
      <PageHeader
        title={t("nav.reports")}
        subtitle={periodText(period)}
        actions={<ReportPeriodSwitch period={period} onChange={changePeriod} />}
        className={styles.header}
      />
      <ReportPeriodBar period={period} onChange={changePeriod} />

      {navigating ? (
        <ReportsContentSkeleton />
      ) : isEmpty ? (
        <Card padding="lg">
          <EmptyState
            icon={ChartPieIcon}
            title={t("reports.empty.title")}
            description={t(
              addTransaction
                ? "reports.empty.description"
                : "reports.empty.viewerDescription",
            )}
            action={
              addTransaction ? (
                <Button iconStart={PlusIcon} onClick={addTransaction}>
                  {t("addTransaction.title")}
                </Button>
              ) : null
            }
            className={styles.empty}
          />
        </Card>
      ) : (
        <>
          <ReportSummary totals={data.totals} previous={data.previousTotals} />
          <div className={styles.columns}>
            <div className={styles.column}>
              <CategoryReport type="expense" rows={data.categories.expense} />
            </div>
            <div className={styles.column}>
              <CategoryReport type="income" rows={data.categories.income} />
              <AccountReport rows={data.accounts} />
            </div>
          </div>
          <MonthlyReport
            months={data.months}
            selected={period.month}
            subtitle={trendSubtitle}
          />
        </>
      )}
    </div>
  );
}

/** The summary and cards while a period loads, laid out like the real ones. */
function ReportsContentSkeleton() {
  const t = useTranslations("reports");
  return (
    <>
      <PageLoadingStatus />
      <ReportSummarySkeleton />
      <div className={styles.columns}>
        <div className={styles.column}>
          <ReportCardSkeleton
            title={t("categories.expenseTitle")}
            chart={<CategoryReportSkeleton />}
          />
        </div>
        <div className={styles.column}>
          <ReportCardSkeleton
            title={t("categories.incomeTitle")}
            chart={<CategoryReportSkeleton rows={3} />}
          />
          <ReportCardSkeleton
            title={t("accounts.title")}
            chart={<BarListSkeleton rows={3} start="tile" />}
          />
        </div>
      </div>
      <ReportCardSkeleton
        title={t("monthly.title")}
        extra={<ColumnChartLegend />}
        chart={<ColumnChartSkeleton columns={REPORT_TREND_MONTHS} />}
      />
    </>
  );
}

/**
 * The reports page while it loads (loading.tsx): the header with the period switch (off, since
 * the period in the URL isn't known yet), the period bar and the cards.
 */
export function ReportsSkeleton() {
  const t = useTranslations("nav");
  return (
    <div className={styles.root}>
      <PageHeader
        title={t("reports")}
        subtitle={<Skeleton variant="text" width="180px" />}
        actions={<ReportPeriodSwitchSkeleton />}
        className={styles.header}
      />
      <ReportPeriodBarSkeleton />
      <ReportsContentSkeleton />
    </div>
  );
}

/** The reports didn't load (error.tsx): the page's header and a retry. */
export function ReportsError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations();
  return (
    <div className={styles.root}>
      <PageHeader title={t("nav.reports")} className={styles.header} />
      <ListError title={t("reports.error")} onRetry={onRetry} />
    </div>
  );
}
