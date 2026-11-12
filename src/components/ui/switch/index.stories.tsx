import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Switch } from "./index";
import { sample } from "@/helpers/sample";

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
      <Switch label={sample("خاموش")} />
      <Switch label={sample("روشن")} defaultChecked />
      <Switch label={sample("کوچک")} size="sm" defaultChecked />
      <Switch label={sample("غیرفعال")} disabled />
      <Switch label={sample("غیرفعال و روشن")} disabled defaultChecked />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: "تم تیره",
    description: "اگر خاموش باشد، از تنظیم دستگاه پیروی می‌کند.",
  },
};
