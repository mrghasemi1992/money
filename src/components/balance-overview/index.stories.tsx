import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ACCOUNTS } from "@/components/account-list/sample-accounts";

import { BalanceOverview, BalanceOverviewSkeleton } from "./index";

const meta = {
  title: "Components/BalanceOverview",
  component: BalanceOverview,
  args: { accounts: SAMPLE_ACCOUNTS },
  argTypes: { accounts: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof BalanceOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The total of the active accounts and a tile for each; archived accounts are left out. */
export const Default: Story = {};

/** One account below zero: its balance (and the total, if it drops below) gets «−». */
export const Negative: Story = {
  args: {
    accounts: [
      ...SAMPLE_ACCOUNTS,
      {
        id: "5d0f6f43-6a8c-4c3e-9a51-0d8e7f1a2b99",
        name: "کارت اعتباری",
        type: "bank",
        balance: -4200000,
        archived: false,
      },
    ],
  },
};

/** Phones: the tiles scroll from edge to edge of the card. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Loading: Story = {
  render: () => <BalanceOverviewSkeleton />,
};
