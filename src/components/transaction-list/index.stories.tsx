import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "@/components/ui/card";
import { SMALL_PHONE_GLOBALS } from "@/constants/worst-case";

import { TransactionList } from "./index";
import {
  SAMPLE_TODAY,
  SAMPLE_TRANSACTIONS,
  WORST_CASE_TRANSACTIONS,
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
 * Days with their net; an unknown transaction (no category: the «ناشناس» tag), one without
 * a description, a transfer with its route, Claude's mark, tags and subcategories. Edit and delete on each row for editors and admins.
 */
export const Default: Story = {};

/** Viewers: no edit or delete buttons; rows still open the detail. */
export const Viewer: Story = { args: { canWrite: false } };

/** More rows than one page: «نمایش بیشتر». */
export const HasMore: Story = { args: { hasMore: true, onLoadMore: () => {} } };

export const LoadingMore: Story = {
  args: { hasMore: true, loadingMore: true, onLoadMore: () => {} },
};

/**
 * Phones: the title (up to two lines) and the description with the account take the whole
 * width, the tags go under them and the amount gets the last line; Claude's mark is an icon.
 */
export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/**
 * The worst case on a 320px phone: amounts in the billions, a long category and subcategory, a
 * long description, a long account name (shortened before the description), a transfer between
 * long names, Claude's rows and the unknown tag. Check it in English and with toman too.
 */
export const PhoneWorstCase: Story = {
  globals: SMALL_PHONE_GLOBALS,
  args: {
    transactions: WORST_CASE_TRANSACTIONS,
    dayTotals: sampleDayTotals(WORST_CASE_TRANSACTIONS),
  },
};

export const English: Story = {
  globals: { locale: "en", calendar: "gregorian" },
};
