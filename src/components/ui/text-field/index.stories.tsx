import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AtSignIcon, LockIcon } from "lucide-react";

import { Field } from "@/components/ui/field";

import { TextField } from "./index";

const meta = {
  title: "Design system/TextField",
  component: TextField,
  args: {
    placeholder: "شرح تراکنش",
    size: "md",
    disabled: false,
    invalid: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    iconStart: { control: false },
    iconEnd: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Hover, click and type are live. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <TextField placeholder="خالی" aria-label="خالی" />
      <TextField defaultValue="خرید هفتگی" aria-label="پر" />
      <TextField defaultValue="خرید هفتگی" invalid aria-label="نامعتبر" />
      <TextField defaultValue="خرید هفتگی" disabled aria-label="غیرفعال" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <TextField size="sm" placeholder="کوچک" aria-label="کوچک" />
      <TextField size="md" placeholder="متوسط" aria-label="متوسط" />
      <TextField size="lg" placeholder="بزرگ" aria-label="بزرگ" />
    </div>
  ),
};

/** Usernames are Latin: dir="ltr" keeps them reading left to right. */
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <Field label="نام کاربری">
        <TextField iconStart={AtSignIcon} dir="ltr" placeholder="username" />
      </Field>
      <Field label="رمز عبور">
        <TextField iconStart={LockIcon} type="password" />
      </Field>
      <Field label="درصد">
        <TextField suffix="٪" inputMode="numeric" defaultValue="۲۰" />
      </Field>
    </div>
  ),
};
