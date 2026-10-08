import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionProvider } from "@/components/add-transaction";
import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
} from "@/components/transaction-list/sample-transactions";
import { resolveReportPeriod } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportParams } from "@/types/report";

import { Reports, ReportsError, ReportsSkeleton } from "./index";
import {
  SAMPLE_ACCOUNT_REPORT,
  SAMPLE_CATEGORY_REPORT,
  SAMPLE_PREVIOUS_TOTALS,
  SAMPLE_REPORT_TODAY,
  SAMPLE_REPORT_TOTALS,
  sampleMonthTotals,
} from "./sample-reports";

type ExampleProps = {
  params: ReportParams;
  empty?: boolean;
  /** Editors and admins get the add-transaction form in the empty state. */
  canWrite?: boolean;
};

/** The page for a period of the toolbar's calendar, with sample figures. */
function Example({ params, empty = false, canWrite = true }: ExampleProps) {
  const { calendar } = usePreferences();
  const period = resolveReportPeriod(params, calendar, SAMPLE_REPORT_TODAY);
  const page = (
    <Reports
      period={period}
      data={{
        totals: empty ? { income: 0, expense: 0 } : SAMPLE_REPORT_TOTALS,
        previousTotals: SAMPLE_PREVIOUS_TOTALS,
        categories: empty
          ? { income: [], expense: [] }
          : SAMPLE_CATEGORY_REPORT,
        accounts: empty ? [] : SAMPLE_ACCOUNT_REPORT,
        months: sampleMonthTotals(period.months),
      }}
    />
  );
  return (
    <AddTransactionProvider
      enabled={canWrite}
      options={SAMPLE_TRANSACTION_OPTIONS_PROMISE}
      actions={SAMPLE_ADD_TRANSACTION_ACTIONS}
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

/** The default period: the last 6 months, up to today. */
export const SixMonths: Story = {};

/** One month: the month switcher, and the month by month chart around it. */
export const Month: Story = {
  args: {
    params: {
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 5 },
    },
  },
};

/** The last 12 months. */
export const TwelveMonths: Story = { args: { params: { kind: "12m" } } };

/** A custom range: two dates, compared with as many days before them. */
export const CustomRange: Story = {
  args: { params: { kind: "custom", from: "2026-07-23", to: "2026-09-22" } },
};

/** No income or expense in the period: an invitation to add a transaction. */
export const Empty: Story = { args: { empty: true } };

/** Viewers can't add transactions, so the empty state only suggests another period. */
export const EmptyForViewer: Story = { args: { empty: true, canWrite: false } };

export const Loading: Story = { render: () => <ReportsSkeleton /> };

export const LoadError: Story = {
  render: () => <ReportsError onRetry={() => {}} />,
};
