import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SAMPLE_REPORT_TODAY } from "@/components/reports/sample-reports";
import { resolveReportPeriod } from "@/helpers/report";
import { usePreferences } from "@/hooks/use-preferences";
import type { ReportParams } from "@/types/report";

import { ReportPeriodBar, ReportPeriodSwitch } from "./index";

/** The switch and the bar under it, changing the period in place of the URL. */
function Example({ initial }: { initial: ReportParams }) {
  const { calendar } = usePreferences();
  const [params, setParams] = useState(initial);
  const period = resolveReportPeriod(params, calendar, SAMPLE_REPORT_TODAY);
  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <ReportPeriodSwitch period={period} onChange={setParams} />
      <ReportPeriodBar period={period} onChange={setParams} />
    </div>
  );
}

const meta = {
  title: "Components/ReportPeriod",
  component: Example,
  args: { initial: { kind: "6m" } },
  argTypes: { initial: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The last 6 months, compared with the 6 before, cut at the same day. */
export const RecentMonths: Story = {};

/** One month, with the switcher; the current month has no next one. */
export const Month: Story = {
  args: {
    initial: {
      kind: "month",
      month: { calendar: "jalali", year: 1405, month: 7 },
    },
  },
};

/** Two dates; the previous period is as many days just before. */
export const CustomRange: Story = {
  args: { initial: { kind: "custom", from: "2026-07-23", to: "2026-09-22" } },
};
