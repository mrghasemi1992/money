import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "@/components/ui/card";

import { TransactionList } from "./index";
import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTIONS,
  sampleDayTotals,
} from "./sample-transactions";

const meta = {
  title: "Components/TransactionList",
  component: TransactionList,
  args: {
    transactions: SAMPLE_TRANSACTIONS,
    dayTotals: sampleDayTotals(SAMPLE_TRANSACTIONS),
    canWrite: true,
    onOpen: () => {},
    onEdit: () => {},
    onDelete: () => {},
    today: SAMPLE_TODAY,
  },
  argTypes: {
    transactions: { control: false },
    dayTotals: { control: false },
  },
  decorators: [
    (Story) => (
      <Card padding="none" style={{ overflow: "hidden" }}>
        <Story />
      </Card>
    ),
  ],
  parameters: { layout: "padded" },
} satisfies Meta<typeof TransactionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Days with their net; an unknown transaction («؟»), a transfer with its route, Claude's
 * mark, tags, and a subcategory chip. Edit and delete on each row for editors and admins.
 */
export const Default: Story = {};

/** Viewers: no edit or delete buttons; rows still open the detail. */
export const Viewer: Story = { args: { canWrite: false } };

/** More rows than one page: «نمایش بیشتر». */
export const HasMore: Story = { args: { hasMore: true, onLoadMore: () => {} } };

export const LoadingMore: Story = {
  args: { hasMore: true, loadingMore: true, onLoadMore: () => {} },
};

/** Phones: a tile per row, the category and account under the description. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const English: Story = {
  globals: { locale: "en", calendar: "gregorian" },
};
