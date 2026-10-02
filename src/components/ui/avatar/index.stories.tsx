import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar } from "./index";

const meta = {
  title: "Design system/Avatar",
  component: Avatar,
  args: { name: "محمدرضا قاسمی", size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
    >
      <Avatar name="سارا" size="sm" />
      <Avatar name="سارا" size="md" />
      <Avatar name="سارا" size="lg" />
      <Avatar name="سارا" size="xl" />
    </div>
  ),
};

/** Each name always gets the same tint. */
export const Names: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-2)" }}>
      {["مریم", "علی", "نگار", "رضا", "Admin", "پویا"].map((name) => (
        <Avatar key={name} name={name} size="lg" />
      ))}
    </div>
  ),
};
