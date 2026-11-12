import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_REPORT_TODAY,
  sampleMonthTotals,
} from "@/components/reports/sample-reports";
import { resolveReportPeriod } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportMonthTotals, ReportParams } from "@/types/report";

import { SavingsReport } from "./index";

/** The savings rate of a period's months of the toolbar's calendar, with sample figures. */
function Example({
  params,
  change,
}: {
  params: ReportParams;
  /** Adjusts the sample months, such as a month without income. */
  change?: (months: ReportMonthTotals[]) => ReportMonthTotals[];
}) {
  const { calendar } = usePreferences();
  const period = resolveReportPeriod(params, calendar, SAMPLE_REPORT_TODAY);
  const months = sampleMonthTotals(period.months);
  return (
    <SavingsReport months={change ? change(months) : months} subtitle="" />
  );
}

const meta = {
  title: "Components/SavingsReport",
  component: Example,
  args: { params: { kind: "6m" } },
  argTypes: { params: { control: false }, change: { control: false } },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Six months: one spent more than it earned, so its bar runs the other way from zero. */
export const SixMonths: Story = {};

/** Twelve months. */
export const TwelveMonths: Story = { args: { params: { kind: "12m" } } };

/** A month without income has no rate, and one that spent three times its income stops at −100%. */
export const NoIncomeAndOverspent: Story = {
  args: {
    change: (months) =>
      months.map((month, index) =>
        index === 1
          ? { ...month, income: 0 }
          : index === 3
            ? { ...month, income: 15000000, expense: 45000000 }
            : month,
      ),
  },
};

/** No income in any of the months. */
export const Empty: Story = {
  args: {
    change: (months) => months.map((month) => ({ ...month, income: 0 })),
  },
};
