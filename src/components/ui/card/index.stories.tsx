import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EllipsisVerticalIcon } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";

import { Card } from "./index";

const meta = {
  title: "Design system/Card",
  component: Card,
  args: {
    title: "هزینه‌های این ماه",
    subtitle: "مهر ۱۴۰۵",
    children: "محتوای کارت",
    variant: "default",
    padding: "md",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "sunken", "brand"],
    },
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActionsAndFooter: Story = {
  args: {
    actions: (
      <IconButton icon={EllipsisVerticalIcon} label="گزینه‌ها" size="sm" />
    ),
    footer: <span className="type-caption">به‌روزشده امروز</span>,
  },
};

/** At most one per screen: the total balance. */
export const Brand: Story = {
  args: { variant: "brand", title: "موجودی کل", subtitle: "۴ حساب" },
};

export const Sunken: Story = {
  args: { variant: "sunken", title: undefined, subtitle: undefined },
};

/** The whole card is a link: it lifts on hover and settles on press. */
export const AsLink: Story = {
  args: { href: "/budgets", title: "بودجه خوراک" },
};
