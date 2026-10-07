import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";

import { SAMPLE_ACCOUNTS } from "@/components/account-list/sample-accounts";
import type { Account, AccountInput } from "@/types/account";
import type { ActionResult } from "@/types/action";

import {
  AccountSettings,
  AccountSettingsError,
  AccountSettingsSkeleton,
} from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));
const ok = async (): Promise<ActionResult> => {
  await wait();
  return { ok: true };
};

const meta = {
  title: "Components/AccountSettings",
  component: AccountSettings,
  args: {
    accounts: SAMPLE_ACCOUNTS,
    canWrite: true,
    onCreate: async () => {
      await wait();
      return { ok: true, id: crypto.randomUUID() };
    },
    onUpdate: ok,
    onArchive: ok,
    onDelete: ok,
    onReorder: ok,
  },
  argTypes: { accounts: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof AccountSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The page with working fakes: add, edit, reorder, archive, restore and delete (accounts with
 * transactions only archive). Changes stay in the story, as the page's refresh would show them.
 */
export const Default: Story = {
  render: function Example(args) {
    const [accounts, setAccounts] = useState(args.accounts);
    // Undo runs from a toast made earlier: read the latest list, not the one it saw.
    const latest = useRef(accounts);
    latest.current = accounts;
    const patch = (id: string, change: Partial<Account>) =>
      setAccounts((current) =>
        current.map((account) =>
          account.id === id ? { ...account, ...change } : account,
        ),
      );
    const taken = (name: string, id?: string) =>
      latest.current.some(
        (account) =>
          account.id !== id &&
          account.name.toLowerCase() === name.trim().toLowerCase(),
      );
    const nameTaken = {
      ok: false,
      field: "name",
      error: "حسابی با این نام وجود دارد.",
    } as const;
    return (
      <AccountSettings
        {...args}
        accounts={accounts}
        onCreate={async (input: AccountInput) => {
          await wait();
          if (taken(input.name)) return nameTaken;
          const id = crypto.randomUUID();
          setAccounts((current) => [
            ...current,
            {
              ...input,
              name: input.name.trim(),
              id,
              balance: input.openingBalance,
              archived: false,
              transactionCount: 0,
            },
          ]);
          return { ok: true, id };
        }}
        onUpdate={async ({ id, ...input }) => {
          await wait();
          if (taken(input.name, id)) return nameTaken;
          const account = latest.current.find((item) => item.id === id);
          patch(id, {
            ...input,
            name: input.name.trim(),
            balance:
              (account?.balance ?? 0) -
              (account?.openingBalance ?? 0) +
              input.openingBalance,
          });
          return { ok: true };
        }}
        onArchive={async ({ id, archived }) => {
          await wait();
          patch(id, { archived });
          return { ok: true };
        }}
        onDelete={async ({ id }) => {
          await wait();
          setAccounts((current) => current.filter((item) => item.id !== id));
          return { ok: true };
        }}
        onReorder={async ({ ids }) => {
          await wait();
          setAccounts((current) => [
            ...ids.flatMap(
              (id) => current.find((item) => item.id === id) ?? [],
            ),
            ...current.filter((item) => !ids.includes(item.id)),
          ]);
          return { ok: true };
        }}
      />
    );
  },
};

/** Viewers: the same page without add, edit, reorder, archive or delete. */
export const Viewer: Story = { args: { canWrite: false } };

/** No accounts yet. */
export const Empty: Story = { args: { accounts: [] } };

export const EmptyViewer: Story = { args: { accounts: [], canWrite: false } };

/** loading.tsx */
export const Loading: Story = { render: () => <AccountSettingsSkeleton /> };

/** error.tsx */
export const LoadFailed: Story = {
  render: () => <AccountSettingsError onRetry={() => {}} />,
};
