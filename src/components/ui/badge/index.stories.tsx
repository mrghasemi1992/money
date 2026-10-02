import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SparklesIcon } from "lucide-react";

import { Badge } from "./index";

const meta = {
  title: "Design system/Badge",
  component: Badge,
  args: {
    children: "Claude",
    tone: "brand",
    variant: "soft",
    size: "md",
    dot: false,
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "brand", "info", "success", "warning", "danger"],
    },
    variant: { control: "inline-radio", options: ["soft", "solid", "outline"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    icon: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Entries saved through the connector carry this badge. */
export const Claude: Story = { args: { icon: SparklesIcon, size: "sm" } };

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      {(["soft", "solid", "outline"] as const).map((variant) => (
        <div
          key={variant}
          style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}
        >
          <Badge variant={variant}>بایگانی</Badge>
          <Badge variant={variant} tone="brand">
            Claude
          </Badge>
          <Badge variant={variant} tone="info">
            CSV
          </Badge>
          <Badge variant={variant} tone="success" dot>
            فعال
          </Badge>
          <Badge variant={variant} tone="warning">
            نزدیک به سقف
          </Badge>
          <Badge variant={variant} tone="danger">
            غیرفعال
          </Badge>
        </div>
      ))}
    </div>
  ),
};
