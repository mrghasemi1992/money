import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Logo } from "./index";

const meta = {
  title: "Design system/Logo",
  component: Logo,
  args: { variant: "lockup", size: "md", tone: "brand" },
  argTypes: {
    variant: { control: "inline-radio", options: ["lockup", "wordmark"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    tone: { control: "inline-radio", options: ["brand", "inverse", "mono"] },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

const stack = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "var(--space-5)",
} as const;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
      <Logo size="xl" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Logo size="lg" />
      <Logo size="lg" variant="wordmark" />
      <span
        style={{
          padding: "var(--space-4)",
          background: "var(--surface-brand)",
          borderRadius: "var(--radius-card)",
        }}
      >
        <Logo size="lg" tone="inverse" />
      </span>
      <span style={{ color: "var(--text-secondary)" }}>
        <Logo size="lg" tone="mono" />
      </span>
    </div>
  ),
};
