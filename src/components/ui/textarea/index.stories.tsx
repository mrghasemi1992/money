import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field } from "@/components/ui/field";

import { Textarea } from "./index";

const meta = {
  title: "Design system/Textarea",
  component: Textarea,
  args: {
    placeholder: "یادداشت",
    showCount: false,
    disabled: false,
    invalid: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithCount: Story = {
  args: {
    showCount: true,
    maxLength: 200,
    defaultValue: "قسط دوم وام، بقیه ماه بعد.",
  },
};

export const InField: Story = {
  render: () => (
    <Field label="یادداشت" optional hint="فقط خودتان می‌بینید.">
      <Textarea showCount maxLength={200} />
    </Field>
  ),
};

export const Invalid: Story = { args: { invalid: true, defaultValue: "متن" } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "متن" },
};
