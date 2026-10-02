import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRightIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "./index";

const meta = {
  title: "Design system/Button",
  component: Button,
  args: {
    children: "ثبت هزینه",
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    iconStart: { control: false },
    iconEnd: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  flexWrap: "wrap",
} as const;
const stack = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
} as const;

export const Playground: Story = {};

/** Hover and press are live; Tab through for the focus ring. The last one in each row is disabled. */
export const AllVariants: Story = {
  render: () => (
    <div style={stack}>
      {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
        <div key={variant} style={row}>
          <Button variant={variant} size="sm">
            انصراف
          </Button>
          <Button
            variant={variant}
            iconStart={variant === "danger" ? Trash2Icon : PlusIcon}
          >
            {variant === "danger" ? "حذف تراکنش" : "ثبت درآمد"}
          </Button>
          <Button variant={variant} size="lg">
            ذخیره بودجه
          </Button>
          <Button variant={variant} disabled>
            غیرفعال
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true, children: "در حال ثبت" },
};

/** Directional icons are written in LTR terms (forward = ArrowRightIcon) and mirrored, so in RTL it points left. */
export const WithDirectionalIcon: Story = {
  args: {
    variant: "ghost",
    iconEnd: ArrowRightIcon,
    mirrorIcons: true,
    children: "همه تراکنش‌ها",
  },
};

export const AsLink: Story = {
  args: { href: "/", variant: "secondary", children: "داشبورد" },
};

export const FullWidth: Story = {
  args: { fullWidth: true, size: "lg", children: "ورود" },
  parameters: { layout: "padded" },
};
