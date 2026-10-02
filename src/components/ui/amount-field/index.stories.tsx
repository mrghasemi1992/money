import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Field } from "@/components/ui/field";
import { formatRial } from "@/utils/number";

import { AmountField } from "./index";

const meta = {
  title: "Design system/AmountField",
  component: AmountField,
  args: { showToman: false, size: "md", disabled: false, invalid: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AmountField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { "aria-label": "مبلغ" } };

/** Type or paste Latin, Persian or Arabic digits, with or without separators. */
export const Controlled: Story = {
  render: function ControlledAmount() {
    const [value, setValue] = useState<number | null>(2500000);
    return (
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <Field label="مبلغ" required>
          <AmountField value={value} onValueChange={setValue} showToman />
        </Field>
        <span className="type-caption">
          value: {value === null ? "null" : `${value} (${formatRial(value)})`}
        </span>
      </div>
    );
  },
};

export const WithToman: Story = {
  args: { defaultValue: 850000, showToman: true },
};

export const Invalid: Story = {
  render: () => (
    <Field label="مبلغ" required error="مبلغ را وارد کنید.">
      <AmountField />
    </Field>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: 1200000, disabled: true },
};
