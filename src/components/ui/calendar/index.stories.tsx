import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { formatJalali } from "@/utils/jalali";

import { Calendar } from "./index";

/** Fixed dates so the stories look the same every day: today is 9 Mehr 1405. */
const TODAY = "2026-10-01";

const meta = {
  title: "Design system/Calendar",
  component: Calendar,
  args: { today: TODAY, flat: false, showFooter: true },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a day, or Tab into the grid and use the arrows (right is earlier), Page Up/Down, Home/End. */
export const Playground: Story = {};

export const Selected: Story = { args: { defaultValue: "2026-09-27" } };

/** Only dates up to today can be picked. */
export const WithMax: Story = {
  args: { max: TODAY, defaultValue: "2026-09-29" },
};

/** Esfand 1403 has 30 days (leap year); Esfand 1404 has 29. */
export const LeapEsfand: Story = {
  args: { defaultValue: "2025-03-20", today: "2025-03-20" },
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
        <span className="type-caption">
          value: {value} ({value ? formatJalali(value, "numeric") : "—"})
        </span>
      </div>
    );
  },
};
