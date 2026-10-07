import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { CategoryColorPicker } from "./index";

const meta = {
  title: "Components/CategoryColorPicker",
  component: CategoryColorPicker,
  args: { value: "orange", onValueChange: () => {}, "aria-label": "رنگ" },
} satisfies Meta<typeof CategoryColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Arrow keys move between swatches; the chosen one has a check mark. */
export const Default: Story = {
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    return (
      <CategoryColorPicker {...args} value={value} onValueChange={setValue} />
    );
  },
};

export const Disabled: Story = { args: { disabled: true } };
