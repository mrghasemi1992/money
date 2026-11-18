import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_LARGEST } from "@/components/reports/sample-reports";
import {
  LONG_CATEGORY_NAME,
  SMALL_PHONE_GLOBALS,
  WORST_CASE_SCALE,
} from "@/constants/worst-case";

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

/**
 * The worst case on a 320px phone: amounts in the billions and a long category name. An amount
 * that leaves too little room for the title wraps under it.
 */
export const PhoneWorstCase: Story = {
  globals: SMALL_PHONE_GLOBALS,
  args: {
    transactions: SAMPLE_LARGEST.map((item, index) => ({
      ...item,
      amount: item.amount * WORST_CASE_SCALE,
      category:
        index === 1 && item.category
          ? { ...item.category, parentName: LONG_CATEGORY_NAME }
          : item.category,
    })),
  },
};
