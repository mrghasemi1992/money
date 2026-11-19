import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { sample } from "@/helpers/sample";

import { AccountList, AccountReorderHint } from "./index";
import { SAMPLE_ACCOUNTS, SAMPLE_COUNTERPARTIES } from "./sample-accounts";

const active = SAMPLE_ACCOUNTS.filter((account) => !account.archived);
const people = SAMPLE_COUNTERPARTIES.filter((account) => !account.archived);

const meta = {
  title: "Components/AccountList",
  component: AccountList,
  args: {
    accounts: active,
    canWrite: true,
    onEdit: () => {},
    onReorder: () => {},
    onArchive: () => {},
    onDelete: () => {},
  },
  argTypes: { accounts: { control: false } },
  render: (args) => (
    <Card padding="none">
      <AccountList {...args} />
    </Card>
  ),
} satisfies Meta<typeof AccountList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Drag a row by its handle (from 768px up) or use «انتقال به بالا / پایین» in its menu; the
 * order stays in the story.
 */
export const Reorder: Story = {
  render: function Example(args) {
    const [ids, setIds] = useState(sample(active).map((account) => account.id));
    return (
      <div style={{ display: "grid", gap: "var(--space-2-5)" }}>
        <Card padding="none">
          <AccountList
            {...args}
            accounts={ids.flatMap(
              (id) => sample(active).find((account) => account.id === id) ?? [],
            )}
            onReorder={setIds}
          />
        </Card>
        <AccountReorderHint />
      </div>
    );
  },
};

/** Viewers see balances only: no handles, no menus. */
export const ReadOnly: Story = { args: { canWrite: false } };

/**
 * People and lenders on «طلب و بدهی» (#47): the quiet line says who owes whom («طلب دارید»,
 * «بدهکارید», «تسویه»), and the menu adds «ثبت طلب یا بدهی».
 */
export const Counterparties: Story = {
  args: { kind: "counterparty", accounts: people },
};

export const CounterpartiesReadOnly: Story = {
  args: { ...Counterparties.args, canWrite: false },
};
