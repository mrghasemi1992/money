import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CopyIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

import { Menu, type MenuItem } from "./index";

const rowActions: MenuItem[] = [
  { label: "ویرایش", icon: PencilIcon, shortcut: "E" },
  { label: "رونوشت", icon: CopyIcon },
  { separator: true },
  { label: "حذف تراکنش", icon: Trash2Icon, danger: true },
];

const meta = {
  title: "Design system/Menu",
  component: Menu,
  args: {
    trigger: (
      <IconButton
        icon={EllipsisVerticalIcon}
        label="گزینه‌ها"
        variant="secondary"
      />
    ),
    items: rowActions,
    align: "start",
  },
  argTypes: {
    trigger: { control: false },
    items: { control: false },
    align: { control: "inline-radio", options: ["start", "end"] },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RowActions: Story = {};

export const Open: Story = { args: { open: true } };

export const WithGroupsAndChecks: Story = {
  render: function Example() {
    const [showArchived, setShowArchived] = useState(false);
    const [onlyUnknown, setOnlyUnknown] = useState(true);
    return (
      <Menu
        trigger={
          <Button variant="secondary" iconStart={SlidersHorizontalIcon}>
            نمایش
          </Button>
        }
        items={[
          { groupLabel: "فیلتر" },
          {
            label: "فقط ناشناخته‌ها",
            checked: onlyUnknown,
            onCheckedChange: setOnlyUnknown,
          },
          {
            label: "حساب‌های بایگانی‌شده",
            checked: showArchived,
            onCheckedChange: setShowArchived,
          },
          { separator: true },
          { label: "خروجی CSV", disabled: true },
        ]}
      />
    );
  },
};
