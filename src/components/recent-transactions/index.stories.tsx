import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTIONS,
} from "@/components/transaction-list/sample-transactions";
import { DASHBOARD_RECENT_COUNT } from "@/constants/dashboard";

import { RecentTransactions, RecentTransactionsSkeleton } from "./index";

const meta = {
  title: "Components/RecentTransactions",
  component: RecentTransactions,
  args: {
    transactions: SAMPLE_TRANSACTIONS.slice(0, DASHBOARD_RECENT_COUNT),
    today: SAMPLE_TODAY,
  },
  argTypes: { transactions: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof RecentTransactions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The latest transactions; a row opens its detail. */
export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Loading: Story = {
  render: () => <RecentTransactionsSkeleton />,
};
