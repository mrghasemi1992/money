import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SettingsLinks } from "./index";

const meta = {
  title: "Components/SettingsLinks",
  component: SettingsLinks,
} satisfies Meta<typeof SettingsLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first sections of /settings: import and export, and the Claude and ChatGPT connector. */
export const Default: Story = {};

/** Admins also get user management. */
export const Admin: Story = { args: { isAdmin: true } };
