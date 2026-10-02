import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RadioGroup, type RadioOption } from "./index";

const options: RadioOption[] = [
  { value: "all", label: "همه تراکنش‌ها" },
  {
    value: "unknown",
    label: "ناشناخته‌ها",
    description: "شرحشان «؟» یا خالی است.",
  },
  { value: "claude", label: "ثبت‌شده با Claude" },
  { value: "csv", label: "واردشده از CSV", disabled: true },
];

const meta = {
  title: "Design system/RadioGroup",
  component: RadioGroup,
  args: {
    options,
    defaultValue: "all",
    "aria-label": "نمایش",
    orientation: "vertical",
    disabled: false,
    invalid: false,
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    options: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Arrow keys move the selection; in RTL the right arrow goes to the previous option. */
export const Playground: Story = {};

export const Horizontal: Story = { args: { orientation: "horizontal" } };

export const Invalid: Story = {
  args: { defaultValue: undefined, invalid: true },
};

export const Disabled: Story = { args: { disabled: true } };
