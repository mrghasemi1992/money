import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SMALL_PHONE_GLOBALS } from "@/constants/worst-case";

import { AssistantMark } from "./index";

const meta = {
  title: "Components/AssistantMark",
  component: AssistantMark,
  args: { source: "mcp" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof AssistantMark>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row Claude recorded: the «Claude» badge. */
export const Claude: Story = {};

export const ChatGPT: Story = { args: { source: "chatgpt" } };

/** On phones only the sparkle icon; its name is read by screen readers and shown on hover. */
export const Phone: Story = { globals: SMALL_PHONE_GLOBALS };
