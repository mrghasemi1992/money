import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PiggyBankIcon, Trash2Icon } from "lucide-react";

import { AmountField } from "@/components/ui/amount-field";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import { Dialog, DialogClose } from "./index";

const meta = {
  title: "Design system/Dialog",
  component: Dialog,
  args: {
    title: "حذف تراکنش؟",
    trigger: <Button variant="danger">حذف تراکنش</Button>,
  },
  argTypes: { trigger: { control: false }, icon: { control: false } },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A destructive confirmation names the object, the amount and that it is permanent. */
export const DeleteConfirmation: Story = {
  args: {
    size: "sm",
    icon: Trash2Icon,
    tone: "danger",
    description: "«خرید هفتگی» به مبلغ ۸۵۰٬۰۰۰ ریال برای همیشه حذف می‌شود.",
    footer: (
      <>
        <DialogClose>
          <Button variant="secondary">انصراف</Button>
        </DialogClose>
        <DialogClose>
          <Button variant="danger">حذف تراکنش</Button>
        </DialogClose>
      </>
    ),
  },
};

export const WithForm: Story = {
  args: {
    title: "تعیین بودجه",
    description: "سقف ماهانه برای «خوراک». هر ماه شمسی از نو شروع می‌شود.",
    icon: PiggyBankIcon,
    trigger: <Button>تعیین بودجه</Button>,
    children: (
      <Field label="سقف ماهانه" required>
        <AmountField defaultValue={12000000} showToman />
      </Field>
    ),
    footer: (
      <>
        <DialogClose>
          <Button variant="secondary">انصراف</Button>
        </DialogClose>
        <Button>ذخیره بودجه</Button>
      </>
    ),
  },
};

export const OpenOnLoad: Story = {
  args: { ...DeleteConfirmation.args, defaultOpen: true },
};
