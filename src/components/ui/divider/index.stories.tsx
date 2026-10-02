import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Divider } from "./index";

const meta = {
  title: "Design system/Divider",
  component: Divider,
  args: { orientation: "horizontal", strong: false },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Strong: Story = { args: { strong: true } };

export const WithLabel: Story = { args: { label: "یا" } };

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-3)",
        height: 32,
        alignItems: "center",
      }}
    >
      <span>ماه</span>
      <Divider orientation="vertical" />
      <span>سال</span>
    </div>
  ),
};
