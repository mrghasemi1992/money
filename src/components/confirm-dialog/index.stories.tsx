import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KeyRoundIcon, ShieldOffIcon, UserXIcon } from "lucide-react";

import { ConfirmDialog } from "./index";

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => {},
    title: "غیرفعال کردن کاربر؟",
    description:
      "مریم صادقی (maryam) دیگر نمی‌تواند وارد شود و از همه دستگاه‌ها خارج می‌شود. حساب و داده‌هایش حذف نمی‌شود و هر وقت بخواهید می‌توانید دوباره فعالش کنید.",
    icon: UserXIcon,
    confirmLabel: "غیرفعال کردن کاربر",
  },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DisableUser: Story = {};

export const RemoveAdminRights: Story = {
  args: {
    title: "حذف دسترسی مدیر؟",
    description:
      "امیر حسینی دیگر نمی‌تواند کاربران را مدیریت کند و نقشش «ویرایشگر» می‌شود.",
    icon: ShieldOffIcon,
    confirmLabel: "حذف دسترسی مدیر",
  },
};

/** A warning that isn't destructive gets a primary button. */
export const ResetPassword: Story = {
  args: {
    title: "بازنشانی رمز عبور؟",
    description:
      "رمز فعلی سارا رحیمی دیگر کار نمی‌کند، از همه دستگاه‌ها خارج می‌شود و یک رمز موقت تازه ساخته می‌شود.",
    icon: KeyRoundIcon,
    tone: "warning",
    confirmLabel: "بازنشانی رمز",
  },
};

export const Pending: Story = { args: { pending: true } };

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
