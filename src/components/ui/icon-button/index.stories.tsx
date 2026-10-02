import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { IconButton } from "./index";

const meta = {
  title: "Design system/IconButton",
  component: IconButton,
  args: {
    icon: PencilIcon,
    label: "ویرایش",
    variant: "ghost",
    size: "md",
    shape: "square",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["square", "round"] },
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  flexWrap: "wrap",
} as const;

export const Playground: Story = {};

/** Hover, press and Tab for focus are live. The last one in each row is disabled. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
        <div key={variant} style={row}>
          <IconButton variant={variant} size="sm" icon={XIcon} label="بستن" />
          <IconButton
            variant={variant}
            icon={EllipsisVerticalIcon}
            label="گزینه‌های بیشتر"
          />
          <IconButton
            variant={variant}
            size="lg"
            icon={PlusIcon}
            label="افزودن"
          />
          <IconButton
            variant={variant}
            shape="round"
            icon={Trash2Icon}
            label="حذف"
          />
          <IconButton
            variant={variant}
            icon={PencilIcon}
            label="ویرایش"
            disabled
          />
        </div>
      ))}
    </div>
  ),
};

/** «قبلی» (back) is written as the LTR icon, ChevronLeftIcon, with mirrorIcon; in RTL it points right. */
export const Directional: Story = {
  args: {
    icon: ChevronLeftIcon,
    label: "قبلی",
    mirrorIcon: true,
    variant: "secondary",
  },
};

/** The floating add button in the phone tab bar. */
export const Fab: Story = {
  args: {
    icon: PlusIcon,
    label: "ثبت تراکنش",
    variant: "primary",
    size: "lg",
    shape: "round",
  },
};
