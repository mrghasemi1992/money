import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionProvider } from "@/components/add-transaction";
import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
} from "@/components/transaction-list/sample-transactions";
import { getNavItems } from "@/helpers/navigation";

import { TabBar } from "./index";

const tabs = getNavItems("editor").filter((item) => item.tab);

/** Phones only: hidden from 768px up, so the stories use a phone viewport. */
const meta = {
  title: "Components/TabBar",
  component: TabBar,
  args: { items: tabs },
  argTypes: { items: { control: false } },
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/budgets" } },
  },
  globals: { viewport: { value: "mobile2", isRotated: false } },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Editors and admins: the floating add button in the middle opens the add-transaction sheet. */
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

/** Viewers: the four tabs only. */
export const Viewer: Story = {};

export const OnDashboard: Story = {
  ...WithAddButton,
  parameters: { nextjs: { navigation: { pathname: "/" } } },
};
