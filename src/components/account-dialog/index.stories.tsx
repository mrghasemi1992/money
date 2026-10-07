import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ACCOUNTS } from "@/components/account-list/sample-accounts";
import type { AccountInput } from "@/types/account";
import type { ActionResult } from "@/types/action";

import { AccountDialog } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

const meta = {
  title: "Components/AccountDialog",
  component: AccountDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    account: null,
    onSubmit: async (input: AccountInput): Promise<ActionResult<"name">> => {
      await wait();
      return SAMPLE_ACCOUNTS.some((account) => account.name === input.name)
        ? { ok: false, field: "name", error: "حسابی با این نام وجود دارد." }
        : { ok: true };
    },
    onSaved: () => {},
  },
  argTypes: { account: { control: false } },
} satisfies Meta<typeof AccountDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new account. «بانک ملی» comes back as a taken name. */
export const New: Story = {};

/** Editing an account with transactions: the hint says the balance is recalculated. */
export const Edit: Story = { args: { account: SAMPLE_ACCOUNTS[1] } };

/** An overdrawn card: the starting balance accepts a minus sign. */
export const Negative: Story = { args: { account: SAMPLE_ACCOUNTS[5] } };
