import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_LARGEST } from "@/components/reports/sample-reports";

import { LargestReport } from "./index";

const meta = {
  title: "Components/LargestReport",
  component: LargestReport,
  args: { transactions: SAMPLE_LARGEST, subtitle: "" },
  argTypes: { transactions: { control: false } },
  parameters: {
    layout: "padded",
    nextjs: { navigation: { pathname: "/reports" } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LargestReport>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The five largest expenses (one still unknown) and the three incomes of the period. */
export const Largest: Story = {};

/** Only expenses in the period. */
export const ExpensesOnly: Story = {
  args: {
    transactions: SAMPLE_LARGEST.filter((item) => item.type === "expense"),
  },
};

export const Empty: Story = { args: { transactions: [] } };
