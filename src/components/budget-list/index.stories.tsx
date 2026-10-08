import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "@/components/ui/card";

import { BudgetList, UnbudgetedList } from "./index";
import { SAMPLE_BUDGET_CATEGORIES } from "./sample-budgets";

const BUDGETED = SAMPLE_BUDGET_CATEGORIES.filter(
  (category) => category.budget !== null,
);
const UNBUDGETED = SAMPLE_BUDGET_CATEGORIES.filter(
  (category) => category.budget === null,
);

const meta = {
  title: "Components/BudgetList",
  component: BudgetList,
  args: {
    categories: BUDGETED,
    year: 1405,
    month: 7,
    calendar: "jalali",
    canWrite: true,
    onEdit: () => {},
  },
  argTypes: { categories: { control: false } },
  decorators: [
    (Story) => (
      <Card padding="none" style={{ overflow: "hidden" }}>
        <Story />
      </Card>
    ),
  ],
  parameters: { layout: "padded" },
} satisfies Meta<typeof BudgetList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Most used first: over budget (striped, «… بیش از بودجه»), near the limit from 80% (amber,
 * ⚠) and ok. Each row opens the category's transactions for the month. A table from 56rem
 * of list width; resize the canvas to see the cards.
 */
export const Default: Story = {};

/** Viewers: the same rows without edit buttons. */
export const ReadOnly: Story = { args: { canWrite: false } };

/** The card layout of phones and narrow lists. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 390 }}>
        <Story />
      </div>
    ),
  ],
};

/** A budget whose category was archived keeps its row, marked «بایگانی‌شده». */
export const Archived: Story = {
  args: {
    categories: [{ ...BUDGETED[3], archived: true }, BUDGETED[0]],
  },
};

/** Expense categories without a budget, with what they spent and «تعیین بودجه». */
export const Unbudgeted: Story = {
  render: (args) => (
    <UnbudgetedList
      categories={UNBUDGETED}
      canWrite={args.canWrite}
      onAdd={() => {}}
    />
  ),
};
