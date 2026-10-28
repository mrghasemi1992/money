import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { CategoryIconPicker } from "./index";

const meta = {
  title: "Components/CategoryIconPicker",
  component: CategoryIconPicker,
  args: {
    value: "utensils",
    color: "orange",
    onValueChange: () => {},
    "aria-label": "آیکون",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 440 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryIconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Icons grouped by theme; search in Persian or English («قهوه», “coffee”). The chosen one sits
 * on the category's hue.
 */
export const Default: Story = {
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    return (
      <CategoryIconPicker {...args} value={value} onValueChange={setValue} />
    );
  },
};

export const Income: Story = {
  args: { value: "briefcase-business", color: "green" },
  render: Default.render,
};

export const Disabled: Story = { args: { disabled: true } };
