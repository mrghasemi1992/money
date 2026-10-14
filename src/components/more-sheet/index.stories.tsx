import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getNavItems } from "@/helpers/navigation";

import { MoreSheet } from "./index";

const more = (role: Parameters<typeof getNavItems>[0]) =>
  getNavItems(role).filter((item) => !item.tab);

/** Phones only: the sheet opens from the tab bar's «More» tab. */
const meta = {
  title: "Components/MoreSheet",
  component: MoreSheet,
  args: { open: true, onOpenChange: () => {}, items: more("editor") },
  argTypes: { items: { control: false } },
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/accounts" } },
  },
  globals: { viewport: { value: "mobile2", isRotated: false } },
} satisfies Meta<typeof MoreSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Accounts, categories and settings; the current page is marked. */
export const Editor: Story = {};

/** Admins also get user management. */
export const Admin: Story = { args: { items: more("admin") } };
