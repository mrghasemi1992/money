import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_PREVIOUS_TOTALS,
  SAMPLE_REPORT_TOTALS,
} from "@/components/reports/sample-reports";

import { ReportSummary, ReportSummarySkeleton } from "./index";

const meta = {
  title: "Components/ReportSummary",
  component: ReportSummary,
  args: { totals: SAMPLE_REPORT_TOTALS, previous: SAMPLE_PREVIOUS_TOTALS },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ReportSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** More income and less spending than the period before: both badges are good news. */
export const Better: Story = {};

/** Spending up and income down: red badges that still say «بیشتر» and «کمتر». */
export const Worse: Story = {
  args: {
    totals: { income: 251000000, expense: 270400000 },
    previous: { income: 281700000, expense: 242400000 },
  },
};

/** A net below zero, against the period before. */
export const NegativeNet: Story = {
  args: {
    totals: { income: 120000000, expense: 168000000 },
    previous: { income: 140000000, expense: 131000000 },
  },
};

/** Nothing recorded before: no percent to show. */
export const NoPrevious: Story = {
  args: { previous: { income: 0, expense: 0 } },
};

export const Loading: Story = { render: () => <ReportSummarySkeleton /> };
