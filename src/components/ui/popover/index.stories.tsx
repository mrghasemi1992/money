import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

import { Popover } from "./index";

const meta = {
  title: "Design system/Popover",
  component: Popover,
  args: {
    trigger: (
      <IconButton icon={InfoIcon} label="درباره موجودی" variant="secondary" />
    ),
    title: "موجودی چطور حساب می‌شود؟",
    children:
      "موجودی اولیه، به‌اضافه درآمدها و انتقال‌های ورودی، منهای هزینه‌ها و انتقال‌های خروجی.",
    side: "bottom",
    align: "start",
  },
  argTypes: {
    trigger: { control: false },
    side: { control: "inline-radio", options: ["top", "bottom"] },
    align: { control: "inline-radio", options: ["start", "end"] },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const WithActions: Story = {
  args: {
    trigger: <Button variant="secondary">پیشنهاد Claude</Button>,
    title: "این تراکنش را می‌شناسید؟",
    children: (
      <>
        <span>
          این تراکنش دسته‌بندی ندارد. Claude می‌تواند از روی پیامک بانک حدس
          بزند.
        </span>
        <Button size="sm">پرسیدن از Claude</Button>
      </>
    ),
  },
};
