import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_CATEGORY_REPORT } from "@/components/reports/sample-reports";
import { DASHBOARD_SPENDING_SLICES } from "@/constants/dashboard";
import { spendingSlices } from "@/helpers/dashboard";

import { TopSpending, TopSpendingSkeleton } from "./index";

const meta = {
  title: "Components/TopSpending",
  component: TopSpending,
  args: {
    slices: spendingSlices(
      SAMPLE_CATEGORY_REPORT.expense,
      DASHBOARD_SPENDING_SLICES,
    ),
    year: 1405,
    month: 7,
    calendar: "jalali",
  },
  argTypes: { slices: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof TopSpending>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The largest categories, the rest added up into «سایر». */
export const Default: Story = {};

/** Few categories: each one gets its own slice, no «سایر». */
export const FewCategories: Story = {
  args: {
    slices: spendingSlices(SAMPLE_CATEGORY_REPORT.expense.slice(0, 3), 5),
  },
};

/** Nothing spent this month yet. */
export const Empty: Story = { args: { slices: [] } };

export const Loading: Story = {
  render: () => <TopSpendingSkeleton />,
};
