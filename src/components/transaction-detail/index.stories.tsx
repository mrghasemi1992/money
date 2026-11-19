import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_TRANSACTIONS } from "@/components/transaction-list/sample-transactions";

import { sample } from "@/helpers/sample";

import { TransactionDetail } from "./index";

const byDescription = (description: string) => {
  const found = sample(SAMPLE_TRANSACTIONS).find(
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

/** A longer description, as a note merged into it reads, and tags. */
export const LongDescription: Story = {
  args: { transaction: byDescription("اقامت در رامسر — دو شب، با صبحانه") },
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

/** With the time of day the bank printed (#128), under the date. */
export const WithTime: Story = {
  args: { transaction: byDescription("خرید هفتگی سوپرمارکت") },
};

/** Money lent to a person (#47): a transfer from one of the book's accounts to them. */
export const Loan: Story = {
  args: { transaction: byDescription("قرض برای تعمیر ماشین") },
};

/** A debt no money of the book moved for: «بدهی به مریم», with «طرف حساب». */
export const Payable: Story = {
  args: { transaction: byDescription("قرض از قبل برای جشن تولد") },
};

/** Viewers: no edit or delete. */
export const Viewer: Story = { args: { canWrite: false } };

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  globals: { locale: "en", calendar: "gregorian" },
};
