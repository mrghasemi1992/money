import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MonthOverview, MonthOverviewSkeleton } from "./index";

const meta = {
  title: "Components/MonthOverview",
  component: MonthOverview,
  args: {
    totals: { income: 57000000, expense: 32470000 },
    year: 1405,
    month: 7,
    calendar: "jalali",
  },
  argTypes: { totals: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof MonthOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** More in than out: the net is positive. */
export const Default: Story = {};

/** More out than in: the net gets «−». */
export const Overspent: Story = {
  args: { totals: { income: 18000000, expense: 32470000 } },
};

/** The first day of a month: nothing yet. */
export const Empty: Story = { args: { totals: { income: 0, expense: 0 } } };

export const Loading: Story = {
  render: () => <MonthOverviewSkeleton />,
};
