import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_CATEGORY_REPORT } from "@/components/reports/sample-reports";

import { CategoryReport } from "./index";

const meta = {
  title: "Components/CategoryReport",
  component: CategoryReport,
  args: { type: "expense", rows: SAMPLE_CATEGORY_REPORT.expense },
  argTypes: {
    type: { control: "inline-radio", options: ["expense", "income"] },
    rows: { control: false },
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryReport>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Expenses by category, most first. Tap a category for its subcategories; «خوراک» also had
 * some recorded on the category itself, and the last row has no category yet.
 */
export const Expense: Story = {};

export const Income: Story = {
  args: { type: "income", rows: SAMPLE_CATEGORY_REPORT.income },
};

/** Nothing of this type in the period. */
export const Empty: Story = { args: { rows: [] } };
