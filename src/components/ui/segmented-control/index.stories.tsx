import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowDownIcon, ArrowLeftRightIcon, ArrowUpIcon } from "lucide-react";

import { SegmentedControl, type SegmentOption } from "./index";

const transactionTypes: SegmentOption[] = [
  { value: "expense", label: "هزینه", icon: ArrowUpIcon, tone: "expense" },
  { value: "income", label: "درآمد", icon: ArrowDownIcon, tone: "income" },
  {
    value: "transfer",
    label: "انتقال",
    icon: ArrowLeftRightIcon,
    tone: "transfer",
  },
];

const meta = {
  title: "Design system/SegmentedControl",
  component: SegmentedControl,
  args: {
    options: transactionTypes,
    "aria-label": "نوع تراکنش",
    size: "md",
    fullWidth: false,
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    options: { control: false },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The transaction type switch. The selected label takes the amount color; the word carries the meaning. */
export const TransactionType: Story = {};

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export const PlainSmall: Story = {
  args: {
    size: "sm",
    "aria-label": "بازه",
    options: [
      { value: "month", label: "ماه" },
      { value: "quarter", label: "سه ماه" },
      { value: "year", label: "سال" },
    ],
  },
};

export const Disabled: Story = { args: { disabled: true } };
