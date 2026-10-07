import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ArchivedAccountList } from "@/components/account-list";
import { SAMPLE_ACCOUNTS } from "@/components/account-list/sample-accounts";

import { ArchivedSection } from "./index";

const archived = SAMPLE_ACCOUNTS.filter((account) => account.archived);

const meta = {
  title: "Components/ArchivedSection",
  component: ArchivedSection,
  args: {
    label: "بایگانی‌شده (۱)",
    note: "در فرم‌ها نمی‌آیند؛ تاریخچه‌شان می‌ماند.",
    children: (
      <ArchivedAccountList
        accounts={archived}
        canWrite
        onRestore={() => {}}
        onDelete={() => {}}
      />
    ),
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof ArchivedSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Collapsed under the list; the toggle opens the archived rows. */
export const Collapsed: Story = {};

export const Open: Story = { args: { defaultOpen: true } };
