import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionProvider } from "@/components/add-transaction";
import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
} from "@/components/transaction-list/sample-transactions";
import { getMoreItems, getNavItems, getPhoneTabs } from "@/helpers/navigation";

import { TabBar } from "./index";

const items = getNavItems("editor");
const tabs = getPhoneTabs(items);
const moreItems = getMoreItems(items);

/** Phones only: hidden from 768px up, so the stories use a phone viewport. */
const meta = {
  title: "Components/TabBar",
  component: TabBar,
  args: { items: tabs, moreItems },
  argTypes: { items: { control: false }, moreItems: { control: false } },
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/transactions" } },
  },
  globals: { viewport: { value: "mobile2", isRotated: false } },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Editors and admins: the round add button beside the capsule opens the add-transaction sheet. */
export const WithAddButton: Story = {
  decorators: [
    (Story) => (
      <AddTransactionProvider
        enabled
        options={SAMPLE_TRANSACTION_OPTIONS_PROMISE}
        actions={SAMPLE_ADD_TRANSACTION_ACTIONS}
      >
        <Story />
      </AddTransactionProvider>
    ),
  ],
};

/** Viewers: the tabs and «More», without the add button. */
export const Viewer: Story = {};

export const OnDashboard: Story = {
  ...WithAddButton,
  parameters: { nextjs: { navigation: { pathname: "/" } } },
};

/** A page behind «More» (budgets, accounts, categories) marks the «More» tab. */
export const OnAccounts: Story = {
  ...WithAddButton,
  parameters: { nextjs: { navigation: { pathname: "/accounts" } } },
};
