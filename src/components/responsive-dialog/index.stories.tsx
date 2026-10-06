import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserXIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ResponsiveDialog } from "./index";

const meta = {
  title: "Components/ResponsiveDialog",
  component: ResponsiveDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    title: "غیرفعال کردن کاربر؟",
    description:
      "کاوه نوری دیگر نمی‌تواند وارد شود. حساب و داده‌هایش حذف نمی‌شود.",
    icon: UserXIcon,
    tone: "danger",
    size: "sm",
  },
  argTypes: { icon: { control: false } },
  render: function Example(args) {
    const [open, setOpen] = useState(args.open);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          باز کردن
        </Button>
        <ResponsiveDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                غیرفعال کردن کاربر
              </Button>
            </>
          }
        />
      </>
    );
  },
} satisfies Meta<typeof ResponsiveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A centered dialog from 768px up. */
export const Desktop: Story = {};

/** A bottom sheet on phones. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
