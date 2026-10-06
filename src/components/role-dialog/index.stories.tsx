import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RoleDialog } from "./index";

const meta = {
  title: "Components/RoleDialog",
  component: RoleDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    onSave: () => {},
    user: { name: "مریم صادقی", role: "editor" },
  },
} satisfies Meta<typeof RoleDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saving: Story = { args: { pending: true } };

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
