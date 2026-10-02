import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Field } from "@/components/ui/field";

import { DatePicker } from "./index";

const TODAY = "2026-10-01";

const meta = {
  title: "Design system/DatePicker",
  component: DatePicker,
  args: {
    today: TODAY,
    "aria-label": "تاریخ",
    format: "weekday",
    size: "md",
    disabled: false,
    invalid: false,
  },
  argTypes: {
    format: {
      control: "inline-radio",
      options: ["long", "weekday", "short", "numeric"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, minHeight: 440 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selected: Story = { args: { defaultValue: TODAY } };

export const Open: Story = { args: { defaultValue: TODAY, open: true } };

/** The value is an ISO string; the box shows Jalali. */
export const InField: Story = {
  render: function Example() {
    const [value, setValue] = useState<string | null>(TODAY);
    return (
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <Field
          label="تاریخ"
          required
          htmlFor="txn-date"
          hint="تاریخ نمی‌تواند در آینده باشد."
        >
          <DatePicker
            id="txn-date"
            today={TODAY}
            max={TODAY}
            value={value}
            onValueChange={setValue}
          />
        </Field>
        <span className="type-caption">value: {String(value)}</span>
      </div>
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <Field label="تاریخ" required htmlFor="d2" error="تاریخ را انتخاب کنید.">
      <DatePicker id="d2" today={TODAY} invalid />
    </Field>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: TODAY, disabled: true },
};
