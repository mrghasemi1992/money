import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Field } from "@/components/ui/field";
import { MONEY_UNITS } from "@/constants/currency";

import { AmountField } from "./index";
import { sample } from "@/helpers/sample";

const meta = {
  title: "Design system/AmountField",
  component: AmountField,
  args: { showEquivalent: false, size: "md", disabled: false, invalid: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    unit: { control: "inline-radio", options: Object.keys(MONEY_UNITS) },
  },
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

/**
 * Type or paste Latin, Persian or Arabic digits, with or without separators. With dollars,
 * euros, pounds or tomans (toolbar), «.» or «٫» starts the decimals. The value is the stored
 * integer: rials or cents.
 */
export const Controlled: Story = {
  render: function ControlledAmount() {
    const [value, setValue] = useState<number | null>(2500000);
    return (
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <Field label={sample("مبلغ")} required>
          <AmountField value={value} onValueChange={setValue} showEquivalent />
        </Field>
        <span className="type-caption">
          value: {value === null ? "null" : value}
        </span>
      </div>
    );
  },
};

/** IRR books: the amount in the other unit under the field (toman under rial, rial under toman). */
export const WithEquivalent: Story = {
  args: { defaultValue: 850000, unit: "rial", showEquivalent: true },
};

/** Dollars always show cents; the stored value is in cents. */
export const Dollars: Story = {
  args: { defaultValue: 123456, unit: "USD" },
};

/** Balances may be negative (an overdrawn card): type «-» or «−» before the number. */
export const Negative: Story = {
  args: { defaultValue: -2500000, allowNegative: true, unit: "rial" },
};

export const Invalid: Story = {
  render: () => (
    <Field label={sample("مبلغ")} required error={sample("مبلغ را وارد کنید.")}>
      <AmountField />
    </Field>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: 1200000, disabled: true },
};
