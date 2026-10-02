import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Field } from "@/components/ui/field";

import { Combobox, type ComboboxGroup } from "./index";

const expenseCategories: ComboboxGroup[] = [
  {
    label: "خوراک",
    color: "orange",
    options: [
      { value: "food-grocery", label: "خرید خانه" },
      { value: "food-restaurant", label: "رستوران" },
      { value: "food-cafe", label: "کافه" },
    ],
  },
  {
    label: "حمل و نقل",
    color: "sky",
    options: [
      { value: "transport-taxi", label: "تاکسی اینترنتی" },
      { value: "transport-fuel", label: "بنزین" },
      { value: "transport-metro", label: "مترو و اتوبوس" },
    ],
  },
  {
    label: "خانه",
    color: "teal",
    options: [
      { value: "home-rent", label: "اجاره" },
      { value: "home-bills", label: "قبض‌ها" },
    ],
  },
  {
    label: "اشتراک‌ها",
    color: "violet",
    options: [{ value: "subs-internet", label: "اینترنت" }],
  },
];

const meta = {
  title: "Design system/Combobox",
  component: Combobox,
  args: {
    groups: expenseCategories,
    "aria-label": "دسته‌بندی",
    size: "md",
    disabled: false,
    invalid: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    groups: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type «رست» or «حمل». Arabic «ي» and «ك» match too. A group's name shows all its options. */
export const Playground: Story = {};

export const Selected: Story = { args: { defaultValue: "food-restaurant" } };

export const Open: Story = { args: { open: true } };

export const Controlled: Story = {
  render: function Example() {
    const [value, setValue] = useState<string | null>("transport-taxi");
    return (
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <Field label="دسته‌بندی" required>
          <Combobox
            groups={expenseCategories}
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
    <Field label="دسته‌بندی" required error="دسته‌بندی را انتخاب کنید.">
      <Combobox groups={expenseCategories} />
    </Field>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: "home-rent", disabled: true },
};
