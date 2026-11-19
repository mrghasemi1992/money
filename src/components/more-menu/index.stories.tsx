import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EllipsisIcon } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { getMoreItems, getNavItems } from "@/helpers/navigation";

import { MoreMenu } from "./index";

const more = (role: Parameters<typeof getNavItems>[0]) =>
  getMoreItems(getNavItems(role));

/** Phones only: the menu opens from the tab bar's «More» tab. */
const meta = {
  title: "Components/MoreMenu",
  component: MoreMenu,
  args: {
    open: true,
    onOpenChange: () => {},
    items: more("editor"),
    trigger: <IconButton label="More" icon={EllipsisIcon} />,
  },
  argTypes: { items: { control: false }, trigger: { control: false } },
  parameters: {
    layout: "centered",
    nextjs: { navigation: { pathname: "/accounts" } },
  },
  globals: { viewport: { value: "mobile2", isRotated: false } },
} satisfies Meta<typeof MoreMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Budgets and loans and debts, a line, accounts and categories, a line, settings; the current
 * page is marked. Every role gets the same sections (user management is a settings subpage).
 */
export const Editor: Story = {};

export const OnSettings: Story = {
  parameters: { nextjs: { navigation: { pathname: "/settings/users" } } },
};
