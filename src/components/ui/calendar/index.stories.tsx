import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Calendar } from "./index";

/** Fixed dates so the stories look the same every day: today is 9 Mehr 1405. */
const TODAY = "2026-10-01";

const meta = {
  title: "Design system/Calendar",
  component: Calendar,
  args: { today: TODAY, flat: false, showFooter: true },
  argTypes: {
    calendar: { control: "inline-radio", options: ["jalali", "gregorian"] },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Click a day, or Tab into the grid and use the arrows (left/right move the way they point on
 * screen), Page Up/Down, Home/End. The calendar follows the toolbar; the `calendar` control
 * overrides it.
 */
export const Playground: Story = {};

export const Selected: Story = { args: { defaultValue: "2026-09-27" } };

/** Only dates up to today can be picked. */
export const WithMax: Story = {
  args: { max: TODAY, defaultValue: "2026-09-29" },
};

/** Esfand 1403 has 30 days (leap year); Esfand 1404 has 29. */
export const LeapEsfand: Story = {
  args: { calendar: "jalali", defaultValue: "2025-03-20", today: "2025-03-20" },
};

/** Gregorian weeks start on Monday, with Saturday and Sunday as the weekend. */
export const Gregorian: Story = {
  args: { calendar: "gregorian", defaultValue: "2026-09-27" },
};

/** February 2028 has 29 days. */
export const LeapFebruary: Story = {
  args: {
    calendar: "gregorian",
    defaultValue: "2028-02-29",
    today: "2028-02-29",
  },
};

export const Flat: Story = {
  args: { flat: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const Controlled: Story = {
  render: function Example() {
    const [value, setValue] = useState<string | null>(TODAY);
    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-3)",
          justifyItems: "start",
        }}
      >
        <Calendar today={TODAY} value={value} onValueChange={setValue} />
        <span className="type-caption">value: {value ?? "—"}</span>
      </div>
    );
  },
};
