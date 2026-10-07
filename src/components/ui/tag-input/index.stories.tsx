import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field } from "@/components/ui/field";

import { TagInput } from "./index";

const SUGGESTIONS = ["کاری", "خانواده", "سفر شمال", "مهمانی", "قابل بازپرداخت"];

const meta = {
  title: "Design system/TagInput",
  component: TagInput,
  args: {
    defaultValue: ["خانواده"],
    suggestions: SUGGESTIONS,
    placeholder: "بنویسید و Enter بزنید",
    suggestionsLabel: "برچسب‌های موجود",
    addLabel: (tag: string) => `افزودن «${tag}»`,
    maxLength: 30,
    "aria-label": "برچسب‌ها",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type to filter the suggestions; Enter adds what was typed, Backspace removes the last chip. */
export const Default: Story = {};

export const Empty: Story = { args: { defaultValue: [] } };

/** The suggestions open. */
export const Open: Story = { args: { open: true } };

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field label="برچسب‌ها" optional>
      <TagInput {...args} />
    </Field>
  ),
};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true } };
