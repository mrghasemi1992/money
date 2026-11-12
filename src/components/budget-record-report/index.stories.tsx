import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_REPORT_TODAY,
  sampleBudgetRecord,
} from "@/components/reports/sample-reports";
import { resolveReportPeriod } from "@/helpers/report";
import { sample } from "@/helpers/sample";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportParams } from "@/types/report";

import { BudgetRecordReport } from "./index";

/** The budgets' record over a period's months of the toolbar's calendar. */
function Example({
  params,
  empty = false,
}: {
  params: ReportParams;
  empty?: boolean;
}) {
  const { calendar } = usePreferences();
  const period = resolveReportPeriod(params, calendar, SAMPLE_REPORT_TODAY);
  return (
    <BudgetRecordReport
      rows={empty ? [] : sample(sampleBudgetRecord(period.months))}
      months={period.months}
      subtitle=""
    />
  );
}

const meta = {
  title: "Components/BudgetRecordReport",
  component: Example,
  args: { params: { kind: "6m" } },
  argTypes: { params: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Six months: food went over twice, fun once (by a trip), subscriptions sit near the limit. */
export const SixMonths: Story = {};

/** Twelve months: the strips get a cell for each. */
export const TwelveMonths: Story = { args: { params: { kind: "12m" } } };

/** No budgets yet. */
export const Empty: Story = { args: { empty: true } };
