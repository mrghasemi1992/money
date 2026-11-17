import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { withAddTransaction } from "@/components/add-transaction/sample-shell";
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
    href: "/transactions?month=1405-07",
    today: SAMPLE_TODAY,
  },
  argTypes: { transactions: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof RecentTransactions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** This month's latest transactions; a row opens its detail. */
export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** No transactions this month yet (even if last month had some); writers can add one. */
export const Empty: Story = {
  args: { transactions: [] },
  decorators: [withAddTransaction],
};

/** Viewers' empty month: no button, the header link still opens this month's list. */
export const EmptyViewer: Story = { args: { transactions: [] } };

export const EmptyMobile: Story = {
  args: { transactions: [] },
  decorators: [withAddTransaction],
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Loading: Story = {
  render: () => <RecentTransactionsSkeleton />,
};
