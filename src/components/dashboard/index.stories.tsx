import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BalanceOverviewSkeleton } from "@/components/balance-overview";
import { BudgetProgressSkeleton } from "@/components/budget-progress";
import { MonthOverviewSkeleton } from "@/components/month-overview";
import { PageHeader } from "@/components/page-header";
import { RecentTransactionsSkeleton } from "@/components/recent-transactions";
import { TopSpendingSkeleton } from "@/components/top-spending";

import { Dashboard } from "./index";
import { SampleDashboard } from "./sample-dashboard";

const meta = {
  title: "Components/Dashboard",
  component: SampleDashboard,
  args: { canWrite: true, unknownCount: 3 },
  parameters: { layout: "padded", nextjs: { navigation: { pathname: "/" } } },
} satisfies Meta<typeof SampleDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A book in use: balances, this month, recent transactions, budgets and top spending. */
export const Populated: Story = {};

/** No unknown transactions: no notice. */
export const AllIdentified: Story = { args: { unknownCount: 0 } };

/** Viewers see the same summary; only the empty budgets card loses its button. */
export const Viewer: Story = { args: { canWrite: false } };

/** Phones: the cards stack and the account tiles scroll sideways. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Each section while its query runs: the page streams them in as they arrive. */
export const Loading: Story = {
  render: () => (
    <Dashboard
      header={<PageHeader title="سلام، سارا" subtitle="چهارشنبه ۱۵ مهر ۱۴۰۵" />}
      balances={<BalanceOverviewSkeleton />}
      month={<MonthOverviewSkeleton />}
      recent={<RecentTransactionsSkeleton />}
      budgets={<BudgetProgressSkeleton />}
      spending={<TopSpendingSkeleton />}
    />
  ),
};
