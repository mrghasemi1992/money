import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BanknoteIcon, CreditCardIcon, WalletIcon } from "lucide-react";
import { useState } from "react";

import { Field } from "@/components/ui/field";

import { Select, type SelectOption } from "./index";

const accounts: SelectOption[] = [
  { value: "melli", label: "کارت ملی", icon: CreditCardIcon },
  { value: "resalat", label: "رسالت", icon: CreditCardIcon },
  { value: "blu", label: "بلو", icon: WalletIcon },
  { value: "cash", label: "نقد", icon: BanknoteIcon, separatorBefore: true },
  { value: "old", label: "حساب قدیمی (بایگانی)", disabled: true },
];

const categories: SelectOption[] = [
  { value: "food", label: "خوراک", color: "orange" },
  { value: "transport", label: "حمل و نقل", color: "sky" },
  { value: "home", label: "خانه", color: "teal" },
  { value: "health", label: "سلامت", color: "red" },
];

const meta = {
  title: "Design system/Select",
  component: Select,
  args: {
    options: accounts,
    placeholder: "انتخاب حساب",
    "aria-label": "حساب",
    size: "md",
    disabled: false,
    invalid: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    options: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selected: Story = { args: { defaultValue: "resalat" } };

export const Open: Story = { args: { defaultValue: "blu", open: true } };

export const WithCategoryDots: Story = {
  args: {
    options: categories,
    placeholder: "دسته‌بندی",
    "aria-label": "دسته‌بندی",
  },
};

export const InFieldWithError: Story = {
  render: function Example() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Field
        label="حساب"
        required
        error={value ? undefined : "حساب را انتخاب کنید."}
      >
        <Select
          options={accounts}
          value={value}
          onValueChange={setValue}
          placeholder="انتخاب حساب"
        />
      </Field>
    );
  },
};

export const Disabled: Story = {
  args: { defaultValue: "cash", disabled: true },
};
