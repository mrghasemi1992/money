import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_TRANSACTIONS } from "@/components/transaction-list/sample-transactions";

import { TransactionDetail } from "./index";

const byDescription = (description: string) => {
  const found = SAMPLE_TRANSACTIONS.find(
    (transaction) => transaction.description === description,
  );
  if (!found) throw new Error(description);
  return found;
};

const meta = {
  title: "Components/TransactionDetail",
  component: TransactionDetail,
  args: {
    open: true,
    onOpenChange: () => {},
    transaction: byDescription("شام با خانواده"),
    canWrite: true,
    onEdit: () => {},
    onDelete: () => {},
  },
  argTypes: { transaction: { control: false } },
} satisfies Meta<typeof TransactionDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Added by one user with Claude, last edited by another. */
export const Default: Story = {};

/** With a note and tags. */
export const WithNote: Story = {
  args: { transaction: byDescription("اقامت در رامسر") },
};

/** An unknown transaction (no category) asks to be identified. */
export const Unknown: Story = {
  args: {
    transaction:
      SAMPLE_TRANSACTIONS.find(
        (item) => item.type !== "transfer" && !item.categoryId,
      ) ?? null,
  },
};

export const Transfer: Story = {
  args: { transaction: byDescription("انتقال برای خرج ماه") },
};

/** Viewers: no edit or delete. */
export const Viewer: Story = { args: { canWrite: false } };

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  globals: { locale: "en", calendar: "gregorian" },
};
