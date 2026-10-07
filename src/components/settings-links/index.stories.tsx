import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SettingsLinks } from "./index";

const meta = {
  title: "Components/SettingsLinks",
  component: SettingsLinks,
} satisfies Meta<typeof SettingsLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first section of /settings: the book's accounts and categories pages. */
export const Default: Story = {};
