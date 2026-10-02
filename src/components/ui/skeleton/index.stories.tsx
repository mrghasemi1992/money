import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./index";

const meta = {
  title: "Design system/Skeleton",
  component: Skeleton,
  args: { variant: "rect", width: "240px", height: "64px" },
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "rect", "circle"] },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** A transaction row while loading. */
export const TransactionRow: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        maxWidth: 420,
      }}
    >
      <Skeleton variant="circle" width="var(--cat-icon)" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" lines={2} />
      </div>
      <Skeleton width="88px" height="20px" />
    </div>
  ),
};

export const Paragraph: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Skeleton variant="text" lines={4} />
    </div>
  ),
};
