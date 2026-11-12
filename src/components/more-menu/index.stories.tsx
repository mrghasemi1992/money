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

/** Budgets, accounts and categories; the current page is marked. */
export const Editor: Story = {};

/** Admins also get user management, after a line. */
export const Admin: Story = { args: { items: more("admin") } };
