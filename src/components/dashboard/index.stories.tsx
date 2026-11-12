import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { withAddTransaction } from "@/components/add-transaction/sample-shell";

import { DashboardSkeleton } from "./index";
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

/** The page while it loads (loading.tsx); each section shows the same skeleton while it streams in. */
export const Loading: Story = {
  render: () => <DashboardSkeleton />,
  decorators: [withAddTransaction],
};

/** Viewers' skeleton: no write controls. */
export const LoadingViewer: Story = { render: () => <DashboardSkeleton /> };
