import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UserMenu } from "./index";

const meta = {
  title: "Components/UserMenu",
  component: UserMenu,
  args: {
    name: "مریم احمدی",
    role: "admin",
    placement: "sidebar",
    onSignOut: async () => {},
  },
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["sidebar", "rail", "top-bar"],
    },
    role: { control: "inline-radio", options: ["admin", "editor", "viewer"] },
  },
  decorators: [
    // Room for the menu, which opens above the sidebar trigger.
    (Story) => (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          width: "var(--sidebar-w)",
          minHeight: 420,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At the bottom of the expanded sidebar; the menu opens above it. */
export const Sidebar: Story = {};

export const SidebarOpen: Story = { args: { open: true } };

/** The collapsed rail: the menu opens beside it, with the name and role on top. */
export const RailOpen: Story = { args: { placement: "rail", open: true } };

/** The phone top bar adds user management for admins, since the sidebar isn't shown. */
export const TopBarOpen: Story = {
  args: { placement: "top-bar", showUsersLink: true, open: true },
  decorators: [
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          width: 360,
          minHeight: 420,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Viewer: Story = {
  args: { name: "سارا محمدی", role: "viewer" },
};
