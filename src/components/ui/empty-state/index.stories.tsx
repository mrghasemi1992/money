import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PiggyBankIcon, PlusIcon, SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EmptyState } from "./index";

const meta = {
  title: "Design system/EmptyState",
  component: EmptyState,
  args: {
    title: "هنوز تراکنشی ثبت نکرده‌اید",
    description: "اولین هزینه یا درآمدتان را ثبت کنید.",
    action: <Button iconStart={PlusIcon}>ثبت تراکنش</Button>,
    size: "md",
  },
  argTypes: {
    icon: { control: false },
    action: { control: false },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoTransactions: Story = {};

export const NoBudgets: Story = {
  args: {
    icon: PiggyBankIcon,
    title: "هنوز بودجه‌ای تعیین نکرده‌اید",
    description: "برای هر دسته سقف ماهانه بگذارید.",
    action: <Button>تعیین بودجه</Button>,
  },
};

export const NoResults: Story = {
  args: {
    icon: SearchXIcon,
    size: "sm",
    title: "نتیجه‌ای پیدا نشد",
    description: "عبارت دیگری را جستجو کنید.",
    action: undefined,
  },
};
