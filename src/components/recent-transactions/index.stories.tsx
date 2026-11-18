import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { withAddTransaction } from "@/components/add-transaction/sample-shell";
import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTIONS,
  WORST_CASE_TRANSACTIONS,
} from "@/components/transaction-list/sample-transactions";
import { DASHBOARD_RECENT_COUNT } from "@/constants/dashboard";
import { SMALL_PHONE_GLOBALS } from "@/constants/worst-case";

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

/** Phones: the title and the description take the whole width, the amount its own line. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/**
 * The worst case on a 320px phone: amounts in the billions, a long category and subcategory, a
 * long description and account name, a transfer between long names and Claude's rows.
 */
export const PhoneWorstCase: Story = {
  globals: SMALL_PHONE_GLOBALS,
  args: {
    transactions: WORST_CASE_TRANSACTIONS.slice(0, DASHBOARD_RECENT_COUNT),
  },
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
