import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTION_OPTIONS,
  SAMPLE_TRANSACTIONS,
} from "@/components/transaction-list/sample-transactions";
import type { TransactionFormValues } from "@/types/transaction";

import { TransactionDialog } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

const meta = {
  title: "Components/TransactionDialog",
  component: TransactionDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    transaction: null,
    options: SAMPLE_TRANSACTION_OPTIONS,
    today: SAMPLE_TODAY,
    onSubmit: async (values: TransactionFormValues) => {
      await wait();
      // The server checks the accounts and category too: the archived account is refused.
      return values.accountId === SAMPLE_TRANSACTION_OPTIONS.accounts[5].id
        ? {
            ok: false as const,
            field: "accountId" as const,
            error: "این حساب بایگانی یا حذف شده است. حساب دیگری انتخاب کنید.",
          }
        : { ok: true as const };
    },
    onDelete: () => {},
  },
  argTypes: { transaction: { control: false }, options: { control: false } },
} satisfies Meta<typeof TransactionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A new expense: the amount is focused, today and the first account are picked. Saving with
 * empty fields shows an error on each; «ثبت و افزودن بعدی» keeps the type, account and date.
 */
export const New: Story = {};

/** Editing: delete at the start of the footer, and the note open. */
export const Edit: Story = {
  args: {
    transaction:
      SAMPLE_TRANSACTIONS.find(
        (item) => item.note && item.type === "expense",
      ) ?? null,
  },
};

export const EditTransfer: Story = {
  args: {
    transaction:
      SAMPLE_TRANSACTIONS.find((item) => item.type === "transfer") ?? null,
  },
};

/** Identifying an unknown transaction: the description starts empty. */
export const EditUnknown: Story = {
  args: {
    transaction:
      SAMPLE_TRANSACTIONS.find((item) => item.description === "؟") ?? null,
  },
};

/** No accounts yet: the form says to add one first. */
export const NoAccounts: Story = {
  args: { options: { ...SAMPLE_TRANSACTION_OPTIONS, accounts: [] } },
};

/** Phones: a bottom sheet; editing puts delete at the bottom of the form. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const PhoneEdit: Story = {
  args: Edit.args,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  globals: { locale: "en", calendar: "gregorian" },
};
