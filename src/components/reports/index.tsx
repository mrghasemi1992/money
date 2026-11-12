"use client";

import { ChartPieIcon, PlusIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useTransition } from "react";

import { useReportNavigation } from "@/components/navigation-progress";
import { useAddTransaction } from "@/components/add-transaction";
import { AccountReport } from "@/components/account-report";
import { BudgetRecordReport } from "@/components/budget-record-report";
import {
  CategoryReport,
  CategoryReportSkeleton,
} from "@/components/category-report";
import { LargestReport } from "@/components/largest-report";
import { MonthlyReport } from "@/components/monthly-report";
import { MoversReport } from "@/components/movers-report";
import { PageHeader } from "@/components/page-header";
import { PageLoadingStatus } from "@/components/page-skeleton";
import { ListError } from "@/components/page-status";
import { ReportCardSkeleton } from "@/components/report-card";
import {
  ReportPeriodBar,
  ReportPeriodSwitch,
  usePeriodText,
} from "@/components/report-period";
import { RecurringReport } from "@/components/recurring-report";
import {
  ReportSummary,
  ReportSummarySkeleton,
} from "@/components/report-summary";
import { ReportTabs } from "@/components/report-tabs";
import { SavingsReport } from "@/components/savings-report";
import { BarListSkeleton } from "@/components/ui/bar-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ColumnChartLegend,
  ColumnChartSkeleton,
} from "@/components/ui/column-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { REPORT_SECTION_PATHS, REPORT_TREND_MONTHS } from "@/constants/report";
import {
  categoryMovers,
  parseReportParams,
  reportParamsToSearch,
  resolveReportPeriod,
} from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type {
  ReportContent,
  ReportParams,
  ReportPeriod,
  ReportSection,
} from "@/types/report";
import { formatMonth } from "@/utils/calendar";
import { todayIso } from "@/utils/iso-date";

import styles from "./styles.module.css";

type ReportsProps = {
  /** The period shown, resolved in the viewer's calendar (from the URL). */
  period: ReportPeriod;
} & ReportContent;

/**
 * The frame every reports tab shares: the header with the period switch, the period bar and
 * the tabs. Changing the period stays on the tab and pushes the URL in a transition; `children`
 * gets `navigating` to show its skeleton meanwhile.
 */
function ReportsFrame({
  period,
  section,
  children,
}: {
  period: ReportPeriod;
  section: ReportSection;
  children: (navigating: boolean) => ReactNode;
}) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  useReportNavigation(navigating);
  const periodText = usePeriodText();

  function changePeriod(params: ReportParams) {
    startNavigation(() => {
      router.push(
        `${REPORT_SECTION_PATHS[section]}${reportParamsToSearch(params)}`,
        { scroll: false },
      );
    });
  }

  return (
    <div className={styles.root}>
      <PageHeader
        title={t("reports")}
        subtitle={periodText(period)}
        actions={<ReportPeriodSwitch period={period} onChange={changePeriod} />}
        className={styles.header}
      />
      <ReportPeriodBar period={period} onChange={changePeriod} />
      <ReportTabs section={section} className={styles.tabs} />
      {children(navigating)}
    </div>
  );
}

/** «شش ماه منتهی به آبان ۱۴۰۵» for a single month, otherwise the period: what the chart's months cover. */
function useTrendSubtitle(period: ReportPeriod): string {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { calendar } = usePreferences();
  const periodText = usePeriodText();
  return period.kind === "month" && period.month
    ? t("monthly.trend", {
        month: formatMonth(
          calendar,
          locale,
          period.month.year,
          period.month.month,
        ),
      })
    : periodText(period);
}

/** Whether a tab has nothing to show: no income or expense in what it covers. */
function isEmptyContent(content: ReportContent): boolean {
  switch (content.section) {
    case "overview":
      return (
        content.data.totals.income === 0 && content.data.totals.expense === 0
      );
    case "breakdown":
      return (
        content.data.categories.income.length === 0 &&
        content.data.categories.expense.length === 0
      );
    case "trends":
      return content.data.months.every(
        (month) => month.income === 0 && month.expense === 0,
      );
  }
}

/**
 * The /reports pages: a period in the URL (a month, the last 3, 6 or 12 months, or a custom
 * range) and three tabs, each its own page. The overview has income, expense and net against
 * the period before, the biggest changes in spending, recurring spending and the largest
 * transactions; the breakdown income and expense by category (subcategories rolled up,
 * opening below them) and spending by account; over time the months as a chart, the savings
 * rate and how often budgets held. Every chart switches to a table of the same figures.
 * Transfers count nowhere.
 */
export function Reports({ period, ...content }: ReportsProps) {
  return (
    <ReportsFrame period={period} section={content.section}>
      {(navigating) =>
        navigating ? (
          <ReportsContentSkeleton section={content.section} />
        ) : isEmptyContent(content) ? (
          <ReportsEmpty />
        ) : (
          <ReportsContent period={period} content={content} />
        )
      }
    </ReportsFrame>
  );
}

/** No income or expense in the period: writers get the add form, viewers another period. */
function ReportsEmpty() {
  const t = useTranslations();
  const addTransaction = useAddTransaction();
  return (
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
  );
}

/** A tab's cards. */
function ReportsContent({
  period,
  content,
}: {
  period: ReportPeriod;
  content: ReportContent;
}) {
  const t = useTranslations("reports");
  const periodText = usePeriodText();
  const trendSubtitle = useTrendSubtitle(period);

  switch (content.section) {
    case "overview": {
      const { data } = content;
      return (
        <>
          <ReportSummary totals={data.totals} previous={data.previousTotals} />
          <div className={styles.columns}>
            <div className={styles.column}>
              <MoversReport
                movers={categoryMovers(data.expenses, data.previousExpenses)}
                subtitle={t("compare", {
                  period: periodText(period.previous),
                })}
              />
            </div>
            <div className={styles.column}>
              <RecurringReport
                items={data.recurring}
                months={period.months}
                subtitle={trendSubtitle}
              />
            </div>
          </div>
          <LargestReport
            transactions={data.largest}
            subtitle={periodText(period)}
          />
        </>
      );
    }
    case "breakdown": {
      const { data } = content;
      return (
        <div className={styles.columns}>
          <div className={styles.column}>
            <CategoryReport type="expense" rows={data.categories.expense} />
          </div>
          <div className={styles.column}>
            <CategoryReport type="income" rows={data.categories.income} />
            <AccountReport rows={data.accounts} />
          </div>
        </div>
      );
    }
    case "trends": {
      const { data } = content;
      return (
        <>
          <MonthlyReport
            months={data.months}
            selected={period.month}
            subtitle={trendSubtitle}
          />
          <div className={styles.columns}>
            <div className={styles.column}>
              <SavingsReport months={data.months} subtitle={trendSubtitle} />
            </div>
            <div className={styles.column}>
              <BudgetRecordReport
                rows={data.budgets}
                months={period.months}
                subtitle={trendSubtitle}
              />
            </div>
          </div>
        </>
      );
    }
  }
}

/*
 * Stand-ins for the figures in the insights' sentences, so a skeleton's hidden sentence (the
 * real message) wraps about as the real one will. Never shown or read.
 */
const SAMPLE_NAME = "Groceries";
const SAMPLE_AMOUNT = "24,000,000 rials";

/** A tab's cards while its period loads, laid out like the real ones. */
function ReportsContentSkeleton({ section }: { section: ReportSection }) {
  const t = useTranslations("reports");
  const status = <PageLoadingStatus />;

  if (section === "breakdown") {
    return (
      <>
        {status}
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
      </>
    );
  }

  if (section === "trends") {
    return (
      <>
        {status}
        <ReportCardSkeleton
          title={t("monthly.title")}
          extra={<ColumnChartLegend />}
          chart={<ColumnChartSkeleton columns={REPORT_TREND_MONTHS} />}
        />
        <div className={styles.columns}>
          <div className={styles.column}>
            <ReportCardSkeleton
              title={t("savings.title")}
              summary={t("savings.saved", { percent: "20%" })}
              chart={<BarListSkeleton rows={REPORT_TREND_MONTHS} />}
            />
          </div>
          <div className={styles.column}>
            <ReportCardSkeleton
              title={t("budgetRecord.title")}
              summary={t("budgetRecord.summary", {
                name: SAMPLE_NAME,
                count: "2",
                total: "6",
              })}
              chart={<BarListSkeleton rows={2} start="chip" />}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {status}
      <ReportSummarySkeleton />
      <div className={styles.columns}>
        <div className={styles.column}>
          <ReportCardSkeleton
            title={t("movers.title")}
            summary={t("movers.up", {
              name: SAMPLE_NAME,
              amount: SAMPLE_AMOUNT,
              percent: "18%",
            })}
            chart={<BarListSkeleton rows={4} start="chip" />}
          />
        </div>
        <div className={styles.column}>
          <ReportCardSkeleton
            title={t("recurring.title")}
            summary={t("recurring.summary", {
              count: "5",
              countNumber: 5,
              amount: SAMPLE_AMOUNT,
            })}
            chart={<BarListSkeleton rows={4} start="tile" />}
          />
        </div>
      </div>
      <ReportCardSkeleton
        title={t("largest.title")}
        summary={t("largest.expenseSummary", {
          amount: SAMPLE_AMOUNT,
          name: SAMPLE_NAME,
          date: "1 Mehr 1405",
        })}
        chart={<BarListSkeleton rows={5} start="tile" />}
      />
    </>
  );
}

/**
 * A reports tab while it loads (its loading.tsx): the real header, period bar and tabs (the
 * period is read from the URL, so switching tabs keeps them still), then the tab's cards as
 * placeholders.
 */
export function ReportsSkeleton({ section }: { section: ReportSection }) {
  const searchParams = useSearchParams();
  const { calendar, timeZone } = usePreferences();
  const period = resolveReportPeriod(
    parseReportParams(searchParams),
    calendar,
    todayIso(timeZone),
  );
  return (
    <ReportsFrame period={period} section={section}>
      {() => <ReportsContentSkeleton section={section} />}
    </ReportsFrame>
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
