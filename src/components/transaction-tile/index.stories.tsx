import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionTile } from "./index";

const meta = {
  title: "Components/TransactionTile",
  component: TransactionTile,
  args: {
    transaction: {
      type: "expense",
      description: "خرید هفتگی",
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
      description: "حقوق مهر",
      category: { name: "حقوق", parentName: null, color: "green" },
    },
  },
};

export const Transfer: Story = {
  args: {
    transaction: { type: "transfer", description: "", category: null },
  },
};

/** A «؟» transaction, still to be identified. */
export const Unknown: Story = {
  args: {
    transaction: { type: "expense", description: "؟", category: null },
  },
};

export const NoCategory: Story = {
  args: {
    transaction: { type: "expense", description: "کارمزد", category: null },
  },
};
