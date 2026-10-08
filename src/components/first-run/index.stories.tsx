import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionProvider } from "@/components/add-transaction";
import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
} from "@/components/transaction-list/sample-transactions";

import { FirstRun } from "./index";

const EMPTY_BOOK = {
  hasAccounts: false,
  hasCategories: false,
  hasTransactions: false,
  connectedClaude: false,
};

const meta = {
  title: "Components/FirstRun",
  component: FirstRun,
  args: { canWrite: true, progress: EMPTY_BOOK },
  parameters: { layout: "padded" },
  // «ثبت تراکنش» opens the same add form as in the app.
  decorators: [
    (Story, { args }) => (
      <AddTransactionProvider
        enabled={args.canWrite}
        options={SAMPLE_TRANSACTION_OPTIONS_PROMISE}
        actions={SAMPLE_ADD_TRANSACTION_ACTIONS}
      >
        <Story />
      </AddTransactionProvider>
    ),
  ],
} satisfies Meta<typeof FirstRun>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An empty book: four steps; a first transaction waits for an account. */
export const Editor: Story = {};

/** Accounts and categories are in: recording a transaction is the next step. */
export const HalfWay: Story = {
  args: {
    progress: { ...EMPTY_BOOK, hasAccounts: true, hasCategories: true },
  },
};

/** Viewers can't set the book up: a short note instead of steps. */
export const Viewer: Story = { args: { canWrite: false } };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const MobileViewer: Story = {
  args: { canWrite: false },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
