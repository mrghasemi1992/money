import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionTile } from "./index";

const meta = {
  title: "Components/TransactionTile",
  component: TransactionTile,
  args: {
    transaction: {
      type: "expense",
      category: { name: "سوپرمارکت", parentName: "خوراک", color: "orange" },
    },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof TransactionTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An expense: the type's arrow on its category's hue. */
export const Expense: Story = {};

export const Income: Story = {
  args: {
    transaction: {
      type: "income",
      category: { name: "حقوق", parentName: null, color: "green" },
    },
  },
};

export const Transfer: Story = {
  args: {
    transaction: { type: "transfer", category: null },
  },
};

/** An expense without a category, still to be identified. */
export const Unknown: Story = {
  args: {
    transaction: { type: "expense", category: null },
  },
};
