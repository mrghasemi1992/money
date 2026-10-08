import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_BUDGET_MONTH } from "@/components/budget-list/sample-budgets";

import { BudgetSummary, BudgetSummarySkeleton } from "./index";

const meta = {
  title: "Components/BudgetSummary",
  component: BudgetSummary,
  args: {
    spent: 290650000,
    budget: 379000000,
    month: SAMPLE_BUDGET_MONTH,
    calendar: "jalali",
  },
  argTypes: { month: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof BudgetSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The current month: the line on the bar is today, 16 days into Mehr. */
export const Current: Story = {};

/** From 80% of the total budget the bar turns amber and says so. */
export const NearLimit: Story = { args: { spent: 320000000 } };

/** Over the total: the remaining cell becomes «بیش از بودجه», in red. */
export const Over: Story = { args: { spent: 402500000 } };

/** A month that has ended: no line for today. */
export const PastMonth: Story = {
  args: {
    month: {
      ...SAMPLE_BUDGET_MONTH,
      month: 6,
      from: "2026-08-23",
      to: "2026-09-22",
      phase: "past",
      days: 31,
      day: 31,
    },
  },
};

export const Loading: Story = { render: () => <BudgetSummarySkeleton /> };
