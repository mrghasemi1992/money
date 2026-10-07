import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TransactionSummary } from "./index";

const meta = {
  title: "Components/TransactionSummary",
  component: TransactionSummary,
  args: { totals: { income: 57000000, expense: 21980000, count: 35 } },
} satisfies Meta<typeof TransactionSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Spent more than came in: the net shows «−». */
export const Negative: Story = {
  args: { totals: { income: 12000000, expense: 18750000, count: 12 } },
};

export const Loading: Story = { args: { totals: null } };

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  globals: { locale: "en", calendar: "gregorian", money: "USD" },
  args: { totals: { income: 520000, expense: 318450, count: 35 } },
};
