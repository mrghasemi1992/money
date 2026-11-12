import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AtSignIcon, LockIcon } from "lucide-react";

import { Field } from "@/components/ui/field";

import { TextField } from "./index";
import { sample } from "@/helpers/sample";

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
      <TextField placeholder={sample("خالی")} aria-label={sample("خالی")} />
      <TextField
        defaultValue={sample("خرید هفتگی")}
        aria-label={sample("پر")}
      />
      <TextField
        defaultValue={sample("خرید هفتگی")}
        invalid
        aria-label={sample("نامعتبر")}
      />
      <TextField
        defaultValue={sample("خرید هفتگی")}
        disabled
        aria-label={sample("غیرفعال")}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <TextField
        size="sm"
        placeholder={sample("کوچک")}
        aria-label={sample("کوچک")}
      />
      <TextField
        size="md"
        placeholder={sample("متوسط")}
        aria-label={sample("متوسط")}
      />
      <TextField
        size="lg"
        placeholder={sample("بزرگ")}
        aria-label={sample("بزرگ")}
      />
    </div>
  ),
};

/** Usernames are Latin: dir="ltr" keeps them reading left to right. */
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <Field label={sample("نام کاربری")}>
        <TextField iconStart={AtSignIcon} dir="ltr" placeholder="username" />
      </Field>
      <Field label={sample("رمز عبور")}>
        <TextField iconStart={LockIcon} type="password" />
      </Field>
      <Field label={sample("درصد")}>
        <TextField
          suffix={sample("٪")}
          inputMode="numeric"
          defaultValue={sample("۲۰")}
        />
      </Field>
    </div>
  ),
};
