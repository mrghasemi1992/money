import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTION_OPTIONS,
} from "@/components/transaction-list/sample-transactions";
import { EMPTY_TRANSACTION_PARAMS } from "@/helpers/transaction-filters";

import { TransactionFilters } from "./index";

const meta = {
  title: "Components/TransactionFilters",
  component: TransactionFilters,
  args: {
    params: EMPTY_TRANSACTION_PARAMS,
    onChange: () => {},
    options: SAMPLE_TRANSACTION_OPTIONS,
    countLabel: "۳۵ تراکنش",
    today: SAMPLE_TODAY,
  },
  argTypes: { params: { control: false }, options: { control: false } },
  parameters: { layout: "padded" },
  render: function Example(args) {
    const [params, setParams] = useState(args.params);
    return (
      <TransactionFilters {...args} params={params} onChange={setParams} />
    );
  },
} satisfies Meta<typeof TransactionFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed by default: the button and the count. Every filter set adds a removable chip. */
export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

/** Expenses tagged «خانواده», with the panel open. */
export const Active: Story = {
  args: {
    defaultOpen: true,
    params: {
      ...EMPTY_TRANSACTION_PARAMS,
      types: ["expense"],
      tag: "خانواده",
      search: "شام",
      from: "2026-09-23",
      to: "2026-10-07",
      categoryId: SAMPLE_TRANSACTION_OPTIONS.categories.expense[0].id,
    },
  },
};

export const Phone: Story = {
  args: Active.args,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  args: { ...Active.args, countLabel: "35 transactions" },
  globals: { locale: "en", calendar: "gregorian" },
};
