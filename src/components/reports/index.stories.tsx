import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionProvider } from "@/components/add-transaction";
import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
} from "@/components/transaction-list/sample-transactions";
import { resolveReportPeriod } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import { REPORT_SECTION_PATHS } from "@/constants/report";
import type { ReportParams, ReportSection } from "@/types/report";

import { Reports, ReportsError, ReportsSkeleton } from "./index";
import {
  SAMPLE_ACCOUNT_REPORT,
  SAMPLE_CATEGORY_REPORT,
  SAMPLE_LARGEST,
  SAMPLE_PREVIOUS_EXPENSES,
  SAMPLE_PREVIOUS_TOTALS,
  SAMPLE_REPORT_TODAY,
  SAMPLE_REPORT_TOTALS,
  sampleBudgetRecord,
  sampleMonthTotals,
  sampleRecurring,
  scaleAccountRows,
  scaleCategoryRows,
} from "./sample-reports";
import { sample } from "@/helpers/sample";
import { addDays, daysBetween } from "@/utils/iso-date";

type ExampleProps = {
  params: ReportParams;
  /** The tab shown. */
  section?: ReportSection;
  empty?: boolean;
  /** Editors and admins get the add-transaction form in the empty state. */
  canWrite?: boolean;
  /** The stories' today; the sample transactions' dates move with it. */
  today?: string;
};

/** The page for a period of the toolbar's calendar, with sample figures. */
function Example({
  params,
  section = "overview",
  empty = false,
  canWrite = true,
  today = SAMPLE_REPORT_TODAY,
}: ExampleProps) {
  const { calendar } = usePreferences();
  const period = resolveReportPeriod(params, calendar, today);
  const shift = daysBetween(SAMPLE_REPORT_TODAY, today);
  const largest = SAMPLE_LARGEST.map((item) => ({
    ...item,
    date: addDays(item.date, shift),
  })).filter((item) => item.date >= period.from && item.date <= period.to);
  const months = sampleMonthTotals(period.months);

  // The sample figures are for 6 months; a month period scales them to its own month.
  let totals = SAMPLE_REPORT_TOTALS;
  let previousTotals = SAMPLE_PREVIOUS_TOTALS;
  let categories = SAMPLE_CATEGORY_REPORT;
  let previousExpenses = SAMPLE_PREVIOUS_EXPENSES;
  let accounts = SAMPLE_ACCOUNT_REPORT;
  if (period.kind === "month" && months.length >= 2) {
    const current = months[months.length - 1];
    const before = months[months.length - 2];
    const expense = current.expense / SAMPLE_REPORT_TOTALS.expense;
    const income = current.income / SAMPLE_REPORT_TOTALS.income;
    categories = {
      expense: scaleCategoryRows(SAMPLE_CATEGORY_REPORT.expense, expense),
      income: scaleCategoryRows(SAMPLE_CATEGORY_REPORT.income, income),
    };
    previousExpenses = scaleCategoryRows(
      SAMPLE_PREVIOUS_EXPENSES,
      before.expense / SAMPLE_PREVIOUS_TOTALS.expense,
    );
    accounts = scaleAccountRows(SAMPLE_ACCOUNT_REPORT, expense);
    const sum = (rows: { amount: number }[]) =>
      rows.reduce((total, row) => total + row.amount, 0);
    totals = {
      income: sum(categories.income),
      expense: sum(categories.expense),
    };
    previousTotals = { income: before.income, expense: sum(previousExpenses) };
  }

  const page =
    section === "overview" ? (
      <Reports
        period={period}
        section="overview"
        data={{
          totals: empty ? { income: 0, expense: 0 } : totals,
          previousTotals,
          expenses: empty ? [] : sample(categories.expense),
          previousExpenses: sample(previousExpenses),
          recurring: empty ? [] : sample(sampleRecurring(period.months)),
          largest: empty ? [] : sample(largest),
        }}
      />
    ) : section === "breakdown" ? (
      <Reports
        period={period}
        section="breakdown"
        data={{
          categories: empty ? { income: [], expense: [] } : sample(categories),
          accounts: empty ? [] : sample(accounts),
        }}
      />
    ) : (
      <Reports
        period={period}
        section="trends"
        data={{
          months: empty
            ? months.map((month) => ({ ...month, income: 0, expense: 0 }))
            : months,
          budgets: sample(sampleBudgetRecord(period.months)),
        }}
      />
    );
  return (
    <AddTransactionProvider
      enabled={canWrite}
      options={sample(SAMPLE_TRANSACTION_OPTIONS_PROMISE)}
      actions={sample(SAMPLE_ADD_TRANSACTION_ACTIONS)}
    >
      {page}
    </AddTransactionProvider>
  );
}

const meta = {
  title: "Components/Reports",
  component: Example,
  args: { params: { kind: "6m" } },
  argTypes: { params: { control: false } },
  parameters: {
    layout: "padded",
    nextjs: { navigation: { pathname: "/reports" } },
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The overview of the default period, the last 6 months up to today. */
export const SixMonths: Story = {};

/** Where the money went: categories and accounts. */
export const Breakdown: Story = {
  args: { section: "breakdown" },
  parameters: {
    nextjs: { navigation: { pathname: REPORT_SECTION_PATHS.breakdown } },
  },
};

/** Month by month: the chart, the savings rate and the budget record. */
export const OverTime: Story = {
  args: { section: "trends" },
  parameters: {
    nextjs: { navigation: { pathname: REPORT_SECTION_PATHS.trends } },
  },
};

/** One month: the month switcher, compared with the month before. */
export const Month: Story = {
  args: {
    params: {
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 5 },
    },
  },
};

/**
 * The current month so far (21 Aban 1405), compared with the same days of Mehr; the time
 * insights cover it and the five months before.
 */
export const CurrentMonth: Story = {
  args: {
    params: {
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 8 },
    },
    today: "2026-11-12",
  },
};

/** The current month over time: it and the five months before, it highlighted. */
export const CurrentMonthOverTime: Story = {
  args: { ...CurrentMonth.args, section: "trends" },
  parameters: OverTime.parameters,
};

/** The last 12 months over time. */
export const TwelveMonths: Story = {
  args: { params: { kind: "12m" }, section: "trends" },
  parameters: OverTime.parameters,
};

/** A custom range: two dates, compared with as many days before them. */
export const CustomRange: Story = {
  args: { params: { kind: "custom", from: "2026-07-23", to: "2026-09-22" } },
};

/** No income or expense in the period: an invitation to add a transaction. */
export const Empty: Story = { args: { empty: true } };

/** Viewers can't add transactions, so the empty state only suggests another period. */
export const EmptyForViewer: Story = { args: { empty: true, canWrite: false } };

export const Loading: Story = {
  render: () => <ReportsSkeleton section="overview" />,
};

export const LoadingBreakdown: Story = {
  render: () => <ReportsSkeleton section="breakdown" />,
  parameters: Breakdown.parameters,
};

export const LoadingOverTime: Story = {
  render: () => <ReportsSkeleton section="trends" />,
  parameters: OverTime.parameters,
};

export const LoadError: Story = {
  render: () => <ReportsError onRetry={() => {}} />,
};
