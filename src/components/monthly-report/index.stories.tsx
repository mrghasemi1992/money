import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_REPORT_TODAY,
  sampleMonthTotals,
} from "@/components/reports/sample-reports";
import { resolveReportPeriod } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportParams } from "@/types/report";

import { MonthlyReport } from "./index";

/** The months of a period of the toolbar's calendar, with sample figures. */
function Example({ params }: { params: ReportParams }) {
  const { calendar } = usePreferences();
  const period = resolveReportPeriod(params, calendar, SAMPLE_REPORT_TODAY);
  return (
    <MonthlyReport
      months={sampleMonthTotals(period.months)}
      selected={period.month}
      subtitle=""
    />
  );
}

const meta = {
  title: "Components/MonthlyReport",
  component: Example,
  args: { params: { kind: "6m" } },
  argTypes: { params: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Six months up to the current one, which is marked «تا امروز». */
export const SixMonths: Story = {};

/** Twelve months: on narrow screens every other label is left out. */
export const TwelveMonths: Story = { args: { params: { kind: "12m" } } };

/** A month picked on the page: highlighted among the five before it. */
export const PickedMonth: Story = {
  args: {
    params: {
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 4 },
    },
  },
};
