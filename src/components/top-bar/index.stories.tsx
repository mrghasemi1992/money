import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TopBar } from "./index";

/** Phones only: hidden from 768px up, so the stories use a phone viewport. */
const meta = {
  title: "Components/TopBar",
  component: TopBar,
  args: {
    user: { name: "مریم احمدی", role: "admin" },
    showUsersLink: true,
    onSignOut: async () => {},
  },
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "mobile2", isRotated: false } },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On a tab page (dashboard, transactions, budget, reports). */
export const OnTab: Story = {};

/** On other pages, a back button leads to the dashboard. */
export const WithBack: Story = { args: { showBack: true } };

export const Viewer: Story = {
  args: {
    user: { name: "سارا محمدی", role: "viewer" },
    showUsersLink: false,
  },
};
