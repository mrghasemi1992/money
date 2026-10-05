import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CircleAlertIcon,
  PiggyBankIcon,
  PlusIcon,
  RotateCwIcon,
  SearchXIcon,
} from "lucide-react";

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
    tone: { control: "inline-radio", options: ["brand", "danger"] },
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

/** An error: danger tone, one way to recover. */
export const Danger: Story = {
  args: {
    icon: CircleAlertIcon,
    tone: "danger",
    title: "مشکلی پیش آمد",
    description: "اطلاعات این صفحه بارگذاری نشد.",
    action: <Button iconStart={RotateCwIcon}>تلاش دوباره</Button>,
  },
};

/** With an eyebrow above the title. */
export const WithEyebrow: Story = {
  args: {
    icon: SearchXIcon,
    eyebrow: "خطای ۴۰۴",
    title: "صفحه پیدا نشد",
    description: "صفحه‌ای که دنبالش هستید وجود ندارد یا جابه‌جا شده است.",
    action: undefined,
  },
};
