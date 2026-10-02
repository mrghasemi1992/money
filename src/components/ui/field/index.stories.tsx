import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AmountField } from "@/components/ui/amount-field";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";

import { Field } from "./index";

const meta = {
  title: "Design system/Field",
  component: Field,
  args: {
    label: "شرح",
    hint: "مثلاً «خرید هفتگی»",
    children: <TextField placeholder="شرح تراکنش" />,
  },
  argTypes: { children: { control: false } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = {};

export const Required: Story = {
  args: {
    label: "مبلغ",
    required: true,
    hint: undefined,
    children: <AmountField required />,
  },
};

export const Optional: Story = {
  args: { label: "یادداشت", optional: true, hint: undefined },
};

/** The error replaces the hint and turns the control red. */
export const WithError: Story = {
  args: {
    label: "مبلغ",
    required: true,
    error: "مبلغ را وارد کنید.",
    children: <AmountField required />,
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: <TextField defaultValue="خرید هفتگی" /> },
};

export const WithSelect: Story = {
  args: {
    label: "حساب",
    hint: undefined,
    children: (
      <Select
        placeholder="انتخاب حساب"
        options={[
          { value: "melli", label: "کارت ملی" },
          { value: "cash", label: "نقد" },
        ]}
      />
    ),
  },
};
