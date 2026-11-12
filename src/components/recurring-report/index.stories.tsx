import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_REPORT_TODAY,
  sampleRecurring,
} from "@/components/reports/sample-reports";
import { resolveReportPeriod } from "@/helpers/report";
import { sample } from "@/helpers/sample";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportParams } from "@/types/report";

import { RecurringReport } from "./index";

/** Recurring expenses over a period's months of the toolbar's calendar. */
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
    <RecurringReport
      items={empty ? [] : sample(sampleRecurring(period.months))}
      months={period.months}
      subtitle=""
    />
  );
}

const meta = {
  title: "Components/RecurringReport",
  component: Example,
  args: { params: { kind: "6m" } },
  argTypes: { params: { control: false } },
  parameters: {
    layout: "padded",
    nextjs: { navigation: { pathname: "/reports" } },
  },
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

/** Six months: what appears in at least 4 of them, the most months first. */
export const SixMonths: Story = {};

/** Three months: 2 of them are enough. */
export const ThreeMonths: Story = { args: { params: { kind: "3m" } } };

/** Nothing came back in most months. */
export const Empty: Story = { args: { empty: true } };

/** A range inside one month: too short to tell. */
export const TooShort: Story = {
  args: {
    params: { kind: "custom", from: "2026-09-24", to: "2026-10-05" },
    empty: true,
  },
};
