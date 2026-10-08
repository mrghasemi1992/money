import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ACCOUNT_OPTIONS } from "@/components/transaction-list/sample-transactions";
import { daysBetween } from "@/utils/iso-date";

import { CsvExport } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

/** A fake count: about four transactions a day, fewer for one account. */
async function count({
  from,
  to,
  accountId,
}: {
  from: string;
  to: string;
  accountId: string | null;
}) {
  await wait();
  const days = daysBetween(from, to) + 1;
  return Math.round(days * (accountId ? 1.5 : 4));
}

const meta = {
  title: "Components/CsvExport",
  component: CsvExport,
  args: {
    accounts: SAMPLE_ACCOUNT_OPTIONS,
    onCount: count,
    onDownload: () => {},
  },
  argTypes: { accounts: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CsvExport>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This month in the viewer's calendar (switch the calendar in the toolbar), all accounts. A
 * preset, the dates or the account change the count; «دانلود CSV» marks the download started.
 */
export const Default: Story = {};

/** An empty range: nothing to download. */
export const Empty: Story = { args: { onCount: async () => 0 } };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
