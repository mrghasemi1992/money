import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionProvider } from "@/components/add-transaction";
import {
  SAMPLE_ADD_TRANSACTION_ACTIONS,
  SAMPLE_TRANSACTION_OPTIONS,
  SAMPLE_TRANSACTION_OPTIONS_PROMISE,
  SAMPLE_TRANSACTIONS,
  sampleDayTotals,
  sampleTotals,
} from "@/components/transaction-list/sample-transactions";
import { EMPTY_TRANSACTION_PARAMS } from "@/helpers/transaction-filters";

import { Transactions, TransactionsError, TransactionsSkeleton } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

const MEHR = SAMPLE_TRANSACTIONS.filter((row) => row.date >= "2026-09-23");

const meta = {
  title: "Components/Transactions",
  component: Transactions,
  args: {
    params: EMPTY_TRANSACTION_PARAMS,
    period: {
      kind: "month",
      year: 1405,
      month: 7,
      from: "2026-09-23",
      to: "2026-10-22",
      isCurrent: true,
    },
    page: { rows: MEHR, nextCursor: null },
    totals: sampleTotals(MEHR),
    dayTotals: sampleDayTotals(MEHR),
    bookIsEmpty: false,
    options: SAMPLE_TRANSACTION_OPTIONS,
    canWrite: true,
    onUpdate: async () => {
      await wait();
      return { ok: true };
    },
    onDelete: SAMPLE_ADD_TRANSACTION_ACTIONS.onDelete,
    onRestore: async () => {
      await wait();
      return { ok: true, id: crypto.randomUUID() };
    },
    onLoadMore: async () => {
      await wait();
      return { rows: [], nextCursor: null };
    },
  },
  argTypes: {
    params: { control: false },
    period: { control: false },
    page: { control: false },
    totals: { control: false },
    dayTotals: { control: false },
    options: { control: false },
  },
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
  parameters: {
    layout: "padded",
    nextjs: { navigation: { pathname: "/transactions" } },
  },
} satisfies Meta<typeof Transactions>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Mehr 1405: the month's totals, the filters and the list. Rows open their detail; edit and
 * delete work with fakes (the page's refresh isn't simulated). In the app the month and
 * filters change the URL.
 */
export const Default: Story = {};

/** Viewers read the same page without add, edit or delete. */
export const Viewer: Story = { args: { canWrite: false } };

/** More than one page: «نمایش بیشتر» at the end. */
export const HasMore: Story = {
  args: { page: { rows: MEHR, nextCursor: "more" } },
};

/** A range from the filters replaces the month switcher. */
export const Range: Story = {
  args: {
    params: {
      ...EMPTY_TRANSACTION_PARAMS,
      from: "2026-09-01",
      to: "2026-10-07",
    },
    period: { kind: "range", from: "2026-09-01", to: "2026-10-07" },
  },
};

export const EmptyMonth: Story = {
  args: {
    period: {
      kind: "month",
      year: 1405,
      month: 6,
      from: "2026-08-23",
      to: "2026-09-22",
      isCurrent: false,
    },
    page: { rows: [], nextCursor: null },
    totals: { income: 0, expense: 0, count: 0 },
    dayTotals: [],
  },
};

export const NoResults: Story = {
  args: {
    ...EmptyMonth.args,
    params: { ...EMPTY_TRANSACTION_PARAMS, types: ["income"], tag: "مدرسه" },
  },
};

/** Nothing recorded in the book yet. */
export const FirstRun: Story = {
  args: { ...EmptyMonth.args, bookIsEmpty: true },
};

export const FirstRunViewer: Story = {
  args: { ...FirstRun.args, canWrite: false },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  args: {
    period: {
      kind: "month",
      year: 2026,
      month: 10,
      from: "2026-10-01",
      to: "2026-10-31",
      isCurrent: true,
    },
  },
  globals: { locale: "en", calendar: "gregorian" },
};

export const Loading: Story = {
  render: () => <TransactionsSkeleton />,
};

export const Error: Story = {
  render: () => <TransactionsError onRetry={() => {}} />,
};
