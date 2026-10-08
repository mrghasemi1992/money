import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_BUDGET_CATEGORIES } from "@/components/budget-list/sample-budgets";
import { DASHBOARD_BUDGET_COUNT } from "@/constants/dashboard";
import { closestBudgets } from "@/helpers/dashboard";

import { BudgetProgress, BudgetProgressSkeleton } from "./index";

const meta = {
  title: "Components/BudgetProgress",
  component: BudgetProgress,
  args: {
    budgets: closestBudgets(SAMPLE_BUDGET_CATEGORIES, DASHBOARD_BUDGET_COUNT),
    canWrite: true,
  },
  argTypes: { budgets: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof BudgetProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The budgets closest to their limit: over, near and fine, each spelled out. */
export const Default: Story = {};

/** No budgets yet: editors and admins get a way to set one. */
export const Empty: Story = { args: { budgets: [] } };

/** Viewers can't set budgets: the note alone. */
export const EmptyViewer: Story = { args: { budgets: [], canWrite: false } };

export const Loading: Story = {
  render: () => <BudgetProgressSkeleton />,
};
