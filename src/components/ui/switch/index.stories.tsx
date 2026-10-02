import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Switch } from "./index";

const meta = {
  title: "Design system/Switch",
  component: Switch,
  args: { label: "نمایش حساب‌های بایگانی‌شده", size: "md", disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Press and hold to see the thumb stretch. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <Switch label="خاموش" />
      <Switch label="روشن" defaultChecked />
      <Switch label="کوچک" size="sm" defaultChecked />
      <Switch label="غیرفعال" disabled />
      <Switch label="غیرفعال و روشن" disabled defaultChecked />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: "تم تیره",
    description: "اگر خاموش باشد، از تنظیم دستگاه پیروی می‌کند.",
  },
};
