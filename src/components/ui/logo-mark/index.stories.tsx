import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LogoMark } from "./index";

const meta = {
  title: "Design system/LogoMark",
  component: LogoMark,
  args: { size: "lg", tone: "brand" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    tone: { control: "inline-radio", options: ["brand", "inverse", "mono"] },
  },
} satisfies Meta<typeof LogoMark>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-4)",
  flexWrap: "wrap",
} as const;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <LogoMark size="sm" />
      <LogoMark size="md" />
      <LogoMark size="lg" />
      <LogoMark size="xl" />
    </div>
  ),
};

/** inverse sits on the brand surface (the balance card); mono takes the text color. */
export const Tones: Story = {
  render: () => (
    <div style={row}>
      <LogoMark size="xl" />
      <span
        style={{
          padding: "var(--space-3)",
          background: "var(--surface-brand)",
          borderRadius: "var(--radius-card)",
        }}
      >
        <LogoMark size="xl" tone="inverse" />
      </span>
      <span style={{ color: "var(--text-secondary)" }}>
        <LogoMark size="xl" tone="mono" />
      </span>
    </div>
  ),
};
