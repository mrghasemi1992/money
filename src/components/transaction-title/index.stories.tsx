import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionTitle } from "./index";

const meta = {
  title: "Components/TransactionTitle",
  component: TransactionTitle,
  args: {
    type: "expense",
    category: { name: "رستوران", parentName: "خوراک" },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof TransactionTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A subcategory with its category. */
export const Subcategory: Story = {};

export const Category: Story = {
  args: { type: "income", category: { name: "حقوق", parentName: null } },
};

export const Transfer: Story = {
  args: { type: "transfer", category: null, from: "رسالت", to: "بلو" },
};

/** An income or expense without a category gets the «ناشناس» tag. */
export const Unknown: Story = {
  args: { category: null },
};
