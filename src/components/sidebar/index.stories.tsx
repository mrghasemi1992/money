import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getNavItems } from "@/helpers/navigation";
import { setSidebarCollapsed } from "@/utils/sidebar";

import { Sidebar } from "./index";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  args: {
    items: getNavItems("admin"),
    user: { name: "مریم احمدی", role: "admin" },
    onSignOut: async () => {},
  },
  argTypes: { items: { control: false } },
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/" } },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Admin: Story = {};

/** Without user management. */
export const Editor: Story = {
  args: {
    items: getNavItems("editor"),
    user: { name: "رضا کریمی", role: "editor" },
  },
};

/** A subpage marks its section: /settings/accounts → Settings. */
export const SettingsSubpage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/settings/accounts" } } },
};

/** The icon rail. Hover or focus an icon for its label. */
export const Collapsed: Story = {
  beforeEach: () => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  },
};
