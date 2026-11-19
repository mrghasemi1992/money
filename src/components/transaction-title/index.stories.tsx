import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  LONG_CATEGORY_NAME,
  LONG_SUBCATEGORY_NAME,
  SMALL_PHONE_GLOBALS,
} from "@/constants/worst-case";

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

/** A receivable (#47): the person owes the book. */
export const Receivable: Story = {
  args: { type: "receivable", category: null, from: "علی رضایی" },
};

/** A payable: the book owes the person. */
export const Payable: Story = {
  args: { type: "payable", category: null, from: "مریم" },
};

/** An income or expense without a category gets the «ناشناس» tag. */
export const Unknown: Story = {
  args: { category: null },
};

/** With `wrap`, on a phone a long title takes up to two lines, then ends with an ellipsis. */
export const WrapOnPhone: Story = {
  args: {
    category: { name: LONG_SUBCATEGORY_NAME, parentName: LONG_CATEGORY_NAME },
    wrap: true,
  },
  globals: SMALL_PHONE_GLOBALS,
  parameters: { layout: "padded" },
};
