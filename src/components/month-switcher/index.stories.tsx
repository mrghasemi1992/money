import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { shiftMonth } from "@/utils/calendar";

import { MonthSwitcher } from "./index";

const meta = {
  title: "Components/MonthSwitcher",
  component: MonthSwitcher,
  args: {
    year: 1405,
    month: 7,
    onPrevious: () => {},
    onNext: () => {},
  },
} satisfies Meta<typeof MonthSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Steps through the months; the current month (Mehr 1405) has no next. */
export const Default: Story = {
  render: function Example(args) {
    const [shown, setShown] = useState({ year: args.year, month: args.month });
    return (
      <MonthSwitcher
        {...args}
        {...shown}
        nextDisabled={shown.year * 12 + shown.month >= 1405 * 12 + 7}
        onPrevious={() => setShown(shiftMonth(shown.year, shown.month, -1))}
        onNext={() => setShown(shiftMonth(shown.year, shown.month, 1))}
      />
    );
  },
};

export const CurrentMonth: Story = { args: { nextDisabled: true } };

/** The Gregorian calendar, in English. */
export const Gregorian: Story = {
  args: { year: 2026, month: 10, calendar: "gregorian" },
  globals: { locale: "en", calendar: "gregorian" },
};
